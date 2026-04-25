import { View, Text, TextInput, Pressable, StyleSheet, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✨ ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error) {
      alert("Wrong email or password");
    }
  };

  return (
    <View style={styles.container}>
      {/* 🌌 BACKGROUND GLOW */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* 🔰 LOGO */}
        <Text style={styles.logo}>🛡 SafeCircle</Text>
        <Text style={styles.subtitle}>Stay Safe. Stay Connected.</Text>

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

        {/* 🔗 FORGOT */}
        <Text style={styles.forgot}>Forgot Password?</Text>

        {/* 🔥 LOGIN BUTTON */}
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        {/* 🔗 REGISTER */}
        <Text style={styles.footer}>
          New user?{" "}
          <Text style={styles.link} onPress={() => router.push("/register")}>
            Create Account
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
    alignItems: "center",
  },

  // 🌌 GLOW EFFECTS
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

  // 🧊 CARD (GLASSMORPHISM)
  card: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 25,
    borderRadius: 20,
    // Removed backdropFilter as it crashes React Native natively.
  },

  logo: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  forgot: {
    color: "#007AFF",
    textAlign: "right",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  footer: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },

  link: {
    color: "#00d4ff",
  },
});