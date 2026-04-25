import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { registerForPushNotifications } from "../services/notificationService";useEffect(() => {
  const saveToken = async () => {
    const token = await registerForPushNotifications();

    if (!token) return;

    const loc = await getUserLocation();

    await addDoc(collection(db, "users"), {
      latitude: loc.latitude,
      longitude: loc.longitude,
      timestamp: Date.now(),
      volunteer: true,
      pushToken: token
    });
  };

  saveToken();
}, []);

export default function HomeScreen({ navigation }) {

  const handleSOS = () => {
    navigation.navigate("Alert");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>SafeCircle</Text>

      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 28,
    marginBottom: 40,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  sosText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
});