import MapView, { Marker } from "react-native-maps";
import {
  View,
  StyleSheet,
  Text,
  Vibration,
  Pressable,
  Linking,
  Alert
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { doc, updateDoc, increment, collection, onSnapshot, addDoc, setDoc } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { getNearbyPlaces } from "../services/placesService";
import { useRouter } from "expo-router";
import { getUserLocation } from "../services/locationService";
import { db, auth } from "../services/firebase"; 
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export default function MapScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  
  // ✅ FIX 2: Read isVictim from params
  const { lat, lng, isVictim } = useLocalSearchParams();

  // --- State Declarations ---
  const [realPlaces, setRealPlaces] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [responders, setResponders] = useState<any[]>([]);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<number | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);

  // --- Refs & Permissions ---
  const lastAlertTimeRef = useRef(0);
  const responderIdRef = useRef(auth?.currentUser?.uid || "unknown");
  const cameraRef = useRef<any>(null);

  // --- Helper Functions ---
  const callPolice = () => Linking.openURL("tel:100");

  const openNavigation = (lat: number, lng: number) => {
    // ✅ FIX 5: Fixed the Map URL query bug
    Linking.openURL(`https://maps.google.com/maps?q=${lat},${lng}`);
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/alert.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
    } catch (error) {
      console.log("Audio recording error:", error);
    }
  };

  const startVideoRecording = async () => {
    try {
      if (!permission?.granted) {
        await requestPermission();
      }

      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

      if (mediaStatus !== "granted") {
        Alert.alert("Permission denied");
        return;
      }

      if (!cameraRef.current) {
        console.log("Camera not ready");
        return;
      }

      const video = await (cameraRef.current as any).recordAsync({
        maxDuration: 10
      });

      await MediaLibrary.createAssetAsync(video.uri);
    } catch (err) {
      console.log("Video error:", err);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
  };

  // --- UseEffects ---
  
  // ✅ FIX 3: Start camera instantly for the victim using the param
  useEffect(() => {
    if (isVictim === "true") {
      setIsRecordingVideo(true);
    }
  }, [isVictim]);

  useEffect(() => {
    const load = async () => {
      if (!location) return;
      const places = await getNearbyPlaces(location.latitude, location.longitude);
      setRealPlaces(places);
    };
    load();
  }, [location]);

  useEffect(() => {
    const i = setInterval(() => setPulse((p) => !p), 500);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    (async () => {
      const loc = await getUserLocation();
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const loc = await getUserLocation();
      setLocation(loc);

      if (auth.currentUser?.uid) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: Date.now(),
          volunteer: true
        }, { merge: true }); 
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "alerts"), (snap) => {
      const data = snap.docs.map((d) => d.data());

      if (data.length > 0) {
        const latest = data[data.length - 1];
        const now = Date.now();

        if (now - latest.timestamp < 15000) {
          const isNewAlert = latest.timestamp !== lastAlertTimeRef.current;

          if (isNewAlert) {
            lastAlertTimeRef.current = latest.timestamp;

            const currentUserId = auth.currentUser?.uid;

            // ✅ FIX 4: Removed the victim early return block that hijacked the camera.
            // ONLY responders get the alert sound and vibration now.
            if (latest.senderId !== currentUserId) {
              Vibration.vibrate([0, 500, 200, 500]);
              playSound();
            }
          }
          
          setAlerts([latest]);
          setCurrentAlert(latest);
          setActiveAlertId(latest.timestamp);
          setAccepted(false);

          if (location) {
            const distanceToMe = getDistance(
              latest.latitude,
              latest.longitude,
              location.latitude,
              location.longitude
            );

            const currentUserId = auth.currentUser?.uid;

            if (latest.senderId !== currentUserId && distanceToMe < 500) {
              setShowPopup(true);
            } else {
              setShowPopup(false);
            }
          }

          setTimeout(() => {
            setAlerts([]);
            setShowPopup(false);
            setCurrentAlert(null);
            setActiveAlertId(null);
          }, 10000);
        } else {
          setAlerts([]);
          setShowPopup(false);
        }
      }
    });

    return unsub;
  }, [location]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = snap.docs.map((d) => d.data());
      setUsers(data.filter((u) => u.volunteer === true));
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (alerts.length && users.length) {
      const a = alerts[0];
      let count = 0;

      users.forEach((u) => {
        if (
          getDistance(+a.latitude, +a.longitude, +u.latitude, +u.longitude) < 200
        ) {
          count++;
        }
      });

      setNearbyCount(count);
    }
  }, [alerts, users]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "responses"), (snap) => {
      const data = snap.docs.map((doc) => doc.data());

      const filtered = data.filter(
        (r: any) =>
          r.alertId === activeAlertId &&
          (r.status === "accepted" || r.status === "tracking") &&
          typeof r.latitude === "number" &&
          typeof r.longitude === "number"
      );

      const latestByResponder = new Map<string, any>();
      filtered
        .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
        .forEach((r: any) => {
          const key = String(r.responder || "unknown");
          latestByResponder.set(key, r);
        });

      const sorted = Array.from(latestByResponder.values()).sort(
        (a: any, b: any) => (b.reputation || 0) - (a.reputation || 0)
      );

      setResponders(sorted);
      data.forEach((doc: any) => {
        if (
          activeAlertId !== null &&
          doc.alertId === activeAlertId &&
          doc.status === "accepted" &&
          !accepted
        ) {
          setAccepted(true);
          Alert.alert("✅ Someone is coming to help!");

          router.push({
            pathname: "/chat",
            params: { alertId: String(activeAlertId) }
          });
        }
      });
    });

    return unsub;
  }, [activeAlertId, accepted, router]);

  useEffect(() => {
    if (!accepted || !currentAlert) return;

    const interval = setInterval(async () => {
      const loc = await getUserLocation();

      await addDoc(collection(db, "responses"), {
        alertId: currentAlert.timestamp,
        responder: responderIdRef.current,
        latitude: loc.latitude,
        longitude: loc.longitude,
        status: "tracking",
        timestamp: Date.now()
      });

      await updateDoc(doc(db, "users", responderIdRef.current), {
        totalResponses: increment(1)
      });
      
      await updateDoc(doc(db, "users", responderIdRef.current), {
        successfulHelps: increment(1),
        reputation: increment(0.2)
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [accepted, currentAlert]);

  // ✅ BONUS FIX: Added cameraRef.current safety check
  useEffect(() => {
    if (isRecordingVideo && cameraRef.current) {
      startVideoRecording();
    }
  }, [isRecordingVideo]);

  if (!permission) {
    return <Text>Loading camera...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Camera permission required</Text>

        <Pressable onPress={requestPermission}>
          <Text style={{ color: "blue", marginTop: 10 }}>
            Allow Camera
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!location) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  // --- Render Configuration ---
  const dangerZones = [
    { lat: location.latitude + 0.002, lng: location.longitude + 0.002 },
    { lat: location.latitude - 0.002, lng: location.longitude - 0.001 }
  ];

  const places = [
    {
      name: "Police Station",
      lat: location.latitude + 0.003,
      lng: location.longitude + 0.001
    },
    {
      name: "Petrol Pump",
      lat: location.latitude - 0.002,
      lng: location.longitude + 0.002
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* 🏆 TOP RESPONDER */}
      {responders.length > 0 && (
        <View style={{
          position: "absolute",
          top: 80,
          left: 20,
          right: 20,
          backgroundColor: "#222",
          padding: 8,
          borderRadius: 10,
          zIndex: 200
        }}>
          <Text style={{ color: "white", textAlign: "center" }}>
            🏆 Top Responder: {responders[0]?.responder}
          </Text>
        </View>
      )}

      {isRecordingVideo && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
      )}

      {alerts.length === 0 && (
        <View style={styles.safeBox}>
          <Text style={styles.safeText}>✅ No emergencies</Text>
        </View>
      )}

      {alerts.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            🚨 EMERGENCY ACTIVE{"\n"}👥 {nearbyCount} responders
          </Text>
        </View>
      )}

      {showPopup && currentAlert && (
        <View style={styles.popup}>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            🚨 Emergency Nearby
          </Text>

          <Text style={{ color: "white" }}>
            👤 Name: {currentAlert.name || "User"}
          </Text>

          <Text style={{ color: "white" }}>
            🎂 Age: {currentAlert.age || 20} | Gender:{" "}
            {currentAlert.gender || "N/A"}
          </Text>

          <Text style={{ color: "white" }}>
            ⭐ Reputation: {currentAlert.reputation || 3}/5
          </Text>

          <Text style={{ color: "white" }}>
            📌 Type: {currentAlert.type || "Emergency"}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Pressable
              onPress={async () => {
                setShowPopup(false);
                setAccepted(true);

                const loc = await getUserLocation();

                await addDoc(collection(db, "responses"), {
                  alertId: currentAlert.timestamp,
                  responder: responderIdRef.current,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  status: "accepted",
                  timestamp: Date.now()
                });

                router.push({
                  pathname: "/map",
                  params: {
                    alertId: String(currentAlert.timestamp),
                    lat: currentAlert.latitude,
                    lng: currentAlert.longitude
                  }
                });
              }}
              style={{ flex: 1, backgroundColor: "green", padding: 10 }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Accept
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPopup(false)}
              style={{ flex: 1, backgroundColor: "red", padding: 10 }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Reject
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
      >
        <Marker coordinate={location} pinColor="blue" title="You" />

        {lat && lng && (
          <Marker
            coordinate={{
              latitude: parseFloat(lat as string),
              longitude: parseFloat(lng as string)
            }}
            pinColor="red"
            title="🚨 Person in Danger"
          />
        )}

        {dangerZones.map((z, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: z.lat, longitude: z.lng }}
            pinColor="orange"
            title="High Risk Area"
          />
        ))}

        {places.map((p, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            pinColor="purple"
            title={p.name}
          />
        ))}

        {alerts.map((a, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: +a.latitude, longitude: +a.longitude }}
            pinColor={
              currentAlert?.type === "Medical"
                ? "blue"
                : currentAlert?.type === "Accident"
                ? "red"
                : "orange"
            }
            onPress={() => openNavigation(a.latitude, a.longitude)}
          />
        ))}

        {alerts.length > 0 &&
          users.map((u, i) => (
            <Marker
              key={i}
              coordinate={{ latitude: +u.latitude, longitude: +u.longitude }}
              pinColor="green"
            />
          ))}

        {responders.map((r, i) => (
          <Marker
            key={`responder-${i}`}
            coordinate={{
              latitude: r.latitude,
              longitude: r.longitude
            }}
            pinColor="green"
            title="Responder 🚑"
          />
        ))}

        {realPlaces.map((p, i) => (
          <Marker
            key={`real-${i}`}
            coordinate={{
              latitude: p.lat,
              longitude: p.lon
            }}
            pinColor={
              p.tags?.amenity === "hospital"
                ? "blue"
                : p.tags?.amenity === "police"
                ? "red"
                : "purple"
            }
            title={p.tags?.name || "Place"}
            description={p.tags?.amenity}
          />
        ))}
      </MapView>

      <Pressable onPress={callPolice} style={styles.callBtn}>
        <Text style={{ color: "white" }}>📞</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 999
  },
  safeBox: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "green",
    padding: 10,
    zIndex: 100,
    borderRadius: 10
  },
  safeText: { color: "white", textAlign: "center" },
  alertBox: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "black",
    padding: 10,
    zIndex: 100,
    borderRadius: 10
  },
  alertText: { color: "white" },
  popup: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#111",
    padding: 15,
    zIndex: 200,
    borderRadius: 10
  },
  callBtn: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "red",
    padding: 15,
    borderRadius: 50
  }
});
