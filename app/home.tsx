import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Linking,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { onSnapshot } from "firebase/firestore";
import * as Notifications from "expo-notifications";

import { auth, db } from "../services/firebase";
import { doc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";

import { useState, useEffect, useRef } from "react";
import { getUserLocation } from "../services/locationService";
import { getCurrentUserProfile } from "../services/userService";
import { registerForPushNotifications } from "../services/notificationService";
import { Accelerometer } from "expo-sensors";

export default function HomeScreen() {
  const router = useRouter();
  const [volunteer, setVolunteer] = useState(false);
  
  // Modal States
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [incomingAlertData, setIncomingAlertData] = useState<any>(null);
  const [infoMessage, setInfoMessage] = useState<{title: string, message: string} | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pulse Animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [scaleAnim]);

  // Listen for incoming alerts
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "alerts"), async (snapshot: any) => {
      snapshot.docChanges().forEach(async (change: any) => {
        if (change.type === "added") {
          const data = change.doc.data();

          const currentUserId = auth.currentUser?.uid;
          if (data.senderId === currentUserId) return;

          // 📍 GET MY LOCATION
          const myLoc = await getUserLocation();

          // 📏 DISTANCE CHECK (~500m)
          const dx = data.latitude - myLoc.latitude;
          const dy = data.longitude - myLoc.longitude;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0.01) return; // ignore far alerts

          // 🔔 SHOW CUSTOM INCOMING ALERT MODAL
          setIncomingAlertData(data);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Save Push Token
  useEffect(() => {
    const saveToken = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await registerForPushNotifications();
        if (!token) return;
        const loc = await getUserLocation();
        const profile = await getCurrentUserProfile();
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
            timestamp: Date.now(),
            volunteer: true,
            pushToken: token,
            name: profile?.name || "User",
            age: profile?.age || 20,
            gender: profile?.gender || "N/A",
            reputation: profile?.reputation || 3,
          },
          { merge: true }
        );
      } catch (error) {
        console.log("Push token save error:", error);
      }
    };
    saveToken();
  }, []);

  // Send SOS
  const handleSOS = async () => {
    try {
      const location = await getUserLocation();
      const profile = await getCurrentUserProfile();

      const user = auth.currentUser;
      if (!user) {
        setInfoMessage({ title: "Error", message: "User not logged in" });
        return;
      }
      const uid = user.uid;
      
      await addDoc(collection(db, "alerts"), {
        senderId: uid,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        timestamp: Date.now(),
        name: profile?.name || "User",
        age: profile?.age || 20,
        gender: profile?.gender || "N/A",
        reputation: profile?.reputation || 3,
      });
      
      const usersSnap = await getDocs(collection(db, "users"));
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (userData.uid === uid) continue;
        if (userData.pushToken) {
          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: userData.pushToken,
              sound: "default",
              title: "🚨 Emergency Alert",
              body: "Someone needs help nearby!",
              data: { screen: "map" },
            }),
          });
        }
      }

      setTimeout(() => {
        router.replace({
          pathname: "/map",
          params: { isVictim: "true" },
        });
      }, 1500);
    } catch (error) {
      console.log("Location error:", error);
      setInfoMessage({ title: "Error", message: "Unable to get location" });
    }
  };

  const confirmSOS = () => {
    setShowSOSModal(true);
  };

  // Accelerometer
  useEffect(() => {
    Accelerometer.setUpdateInterval(500);

    const sub = Accelerometer.addListener((data) => {
      const total = Math.abs(data.x + data.y + data.z);
      if (total > 2.5) {
        if (!showSOSModal) {
          confirmSOS();
        }
      }
    });
    return () => sub.remove();
  }, [showSOSModal]);

  // Update volunteer status
  useEffect(() => {
    const sendUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const loc = await getUserLocation();
        await getCurrentUserProfile();
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
            timestamp: Date.now(),
            volunteer: volunteer,
          },
          { merge: true }
        );
      } catch (error) {
        console.log("User save error:", error);
      }
    };
    sendUser();
  }, [volunteer]);

  const callPolice = () => {
    Linking.openURL("tel:100");
  };

  const openSafePlaces = () => {
    setInfoMessage({
      title: "Safe Places",
      message: "Nearby safe places will be shown on the map screen."
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>SafeCircle</Text>
      
      <Pressable
        onPress={() => setVolunteer(!volunteer)}
        style={styles.volunteer}
      >
        <Text style={styles.volText}>
          {volunteer ? "🟢 Available to Help" : "⚪ Not Available"}
        </Text>
      </Pressable>
      
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable style={styles.sos} onPress={confirmSOS}>
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
      </Animated.View>
      
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => router.replace("/map")}>
          <Text style={styles.btnText}>📍 Live Map</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={callPolice}>
          <Text style={styles.btnText}>📞 Call Police</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={openSafePlaces}>
          <Text style={styles.btnText}>🧭 Safe Places</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => router.push("/assistant")}>
          <Text style={styles.btnText}>🤖 Safety Assistant</Text>
        </Pressable>
      </View>

      {/* 🔴 CONFIRM SOS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSOSModal}
        onRequestClose={() => setShowSOSModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚨 Confirm SOS</Text>
            <Text style={styles.modalText}>
              Are you sure you want to send an emergency alert to nearby volunteers?
            </Text>
            
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowSOSModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={() => {
                  setShowSOSModal(false);
                  handleSOS();
                }}
              >
                <Text style={styles.confirmBtnText}>SEND SOS</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔔 INCOMING SOS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!incomingAlertData}
        onRequestClose={() => setIncomingAlertData(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚨 SOS ALERT</Text>
            <Text style={styles.modalText}>
              <Text style={{fontWeight: 'bold', color: 'white'}}>{incomingAlertData?.name || "Someone"}</Text> needs help nearby!
            </Text>
            
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setIncomingAlertData(null)}
              >
                <Text style={styles.cancelBtnText}>Ignore</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, styles.acceptBtn]} 
                onPress={() => {
                  const lat = incomingAlertData.latitude;
                  const lng = incomingAlertData.longitude;
                  setIncomingAlertData(null);
                  router.push({
                    pathname: "/map",
                    params: { lat, lng }
                  });
                }}
              >
                <Text style={styles.confirmBtnText}>Accept</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ℹ️ INFO / ERROR MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!infoMessage}
        onRequestClose={() => setInfoMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, {color: '#007AFF'}]}>
              {infoMessage?.title}
            </Text>
            <Text style={styles.modalText}>
              {infoMessage?.message}
            </Text>
            
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalBtn, {backgroundColor: '#007AFF', width: '100%'}]} 
                onPress={() => {
                  const title = infoMessage?.title;
                  setInfoMessage(null);
                  if (title === "Safe Places") {
                    router.replace("/map");
                  }
                }}
              >
                <Text style={styles.confirmBtnText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1c",
    justifyContent: "center",
    alignItems: "center",
  },
  glow1: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "#007AFF",
    borderRadius: 150,
    opacity: 0.15,
    top: 100,
    left: -50,
  },
  glow2: {
    position: "absolute",
    width: 250,
    height: 250,
    backgroundColor: "#ff3b30",
    borderRadius: 150,
    opacity: 0.1,
    bottom: 100,
    right: -50,
  },
  title: {
    color: "white",
    fontSize: 30,
    marginBottom: 20,
    fontWeight: "bold",
  },
  volunteer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  volText: {
    color: "white",
  },
  sos: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff3b30",
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
  },
  sosText: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
  },
  actions: {
    marginTop: 40,
    width: "80%",
  },
  btn: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", 
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "#ff3b30",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    color: "#e0e0e0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#555",
  },
  confirmBtn: {
    backgroundColor: "#ff3b30",
    shadowColor: "#ff3b30",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptBtn: {
    backgroundColor: "#34C759", // Green for accept
    shadowColor: "#34C759",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelBtnText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
