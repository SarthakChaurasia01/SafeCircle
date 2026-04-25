import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Alert
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✨ ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]);

    animation.start();

    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, []);

  // 🔥 REGISTER FUNCTION
  const handleRegister = async () => {
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert("Error", "Fill all fields");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Error", "Password must be 6+ chars");
        return;
      }

      // 🔐 CREATE AUTH USER
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const uid = userCred.user.uid;

      // ✅ SAVE USER PROFILE (ONLY ONCE)
      await setDoc(doc(db, "users", uid), {
        name: name.trim(),
        email: email.trim(),
        age: 20,
        gender: "Male",

        // 🔥 TRUST SYSTEM FIELDS
        reputation: 3,
        totalResponses: 0,
        successfulHelps: 0,

        createdAt: Date.now()
      });

      Alert.alert("Success", "Account created!");
      router.replace("/profileSetup");
    } catch (error: any) {
      console.log("Register error:", error);

      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "Email already in use");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Invalid email");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "Password is too weak");
      } else {
        Alert.alert("Error", error.message || "Registration failed");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 🌌 BACKGROUND */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.logo}>🛡 SafeCircle</Text>
        <Text style={styles.subtitle}>Create your safety network</Text>

        {/* 👤 NAME */}
        <TextInput
          placeholder="Name"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* 📧 EMAIL */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* 🔒 PASSWORD */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* 🔥 BUTTON */}
        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Create Account</Text>
        </Pressable>

        {/* 🔗 LOGIN */}
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => router.push("/login")}>
            Login
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1c",
    justifyContent: "center",
    alignItems: "center"
  },

  glow1: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "#007AFF",
    borderRadius: 150,
    opacity: 0.15,
    top: 100,
    left: -50
  },

  glow2: {
    position: "absolute",
    width: 250,
    height: 250,
    backgroundColor: "#ff3b30",
    borderRadius: 150,
    opacity: 0.1,
    bottom: 100,
    right: -50
  },

  card: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 25,
    borderRadius: 20
  },

  logo: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 25
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  footer: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20
  },

  link: {
    color: "#00d4ff"
  }
});