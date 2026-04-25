import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function CompleteProfileScreen() {
  const router = useRouter();

  // Loading state for saving
  const [loading, setLoading] = useState(false);

  // Image states
  const [image, setImage] = useState<string | null>(null);
  const [kycImage, setKycImage] = useState<string | null>(null);

  // Form states
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [blood, setBlood] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medical, setMedical] = useState("");
  const [profession, setProfession] = useState("");
  const [skills, setSkills] = useState("");

  // 📸 Function to Pick Profile Avatar
  const pickImage = async () => {
    // Ask for permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    // Open picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square for avatar
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🔐 Function to Pick KYC Document
  const doKYC = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to upload KYC.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setKycImage(result.assets[0].uri);
      Alert.alert("KYC Uploaded", "Your document has been attached temporarily.");
    }
  };

  // 💾 Function to Save Data to Firebase
  const saveProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to save your profile.");
      return;
    }

    if (!age || !gender) {
      Alert.alert("Required Fields", "Please enter at least your Age and Gender.");
      return;
    }

    setLoading(true);

    try {
      // Note: If you have Firebase Storage set up, you would upload the 'image' and 'kycImage' 
      // URIs to Storage here first, get their download URLs, and save those URLs to Firestore.
      // For now, we are saving the local URIs/text data.

      const profileData = {
        uid: user.uid,
        age: parseInt(age),
        gender: gender,
        bloodGroup: blood,
        allergies: allergies,
        medicalConditions: medical,
        profession: profession,
        skills: skills,
        profileImageLocalUri: image, // Placeholder for Firebase Storage URL
        kycImageLocalUri: kycImage,  // Placeholder for Firebase Storage URL
        profileCompleted: true,
        updatedAt: Date.now(),
      };

      // Save to 'users' collection using the user's UID as the document ID
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });

      Alert.alert("Success", "Profile saved successfully!");
      
      // Redirect to the Home screen or Map screen after successful save
      router.replace("/home"); 

    } catch (error: any) {
      console.error("Error saving profile: ", error);
      Alert.alert("Error", "Could not save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* 🌌 Glow */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>Complete Your Profile</Text>

      {/* 📸 Profile Image */}
      <Pressable onPress={pickImage} style={styles.avatar}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarText}>+</Text>
        )}
      </Pressable>

      {/* 🧊 CARD */}
      <View style={styles.card}>
        {/* 👤 BASIC */}
        <Text style={styles.section}>Basic Info</Text>
        <TextInput
          placeholder="Age"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Gender"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={gender}
          onChangeText={setGender}
        />

        {/* 🏥 MEDICAL */}
        <Text style={styles.section}>Medical Info</Text>
        <TextInput
          placeholder="Blood Group"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={blood}
          onChangeText={setBlood}
        />
        <TextInput
          placeholder="Allergies"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
        />
        <TextInput
          placeholder="Medical Conditions"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={medical}
          onChangeText={setMedical}
        />

        {/* 💼 PROFESSIONAL */}
        <Text style={styles.section}>Professional</Text>
        <TextInput
          placeholder="Profession"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={profession}
          onChangeText={setProfession}
        />
        <TextInput
          placeholder="Skills (CPR, First Aid)"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={skills}
          onChangeText={setSkills}
        />

        {/* 🔐 KYC */}
        <Pressable 
          onPress={doKYC} 
          style={[styles.kycBtn, kycImage ? { backgroundColor: "#34C759" } : {}]}
        >
          <Text style={styles.kycText}>
            {kycImage ? "✅ Identity Attached" : "📸 Upload ID (KYC)"}
          </Text>
        </Pressable>

        {/* SAVE */}
        <Pressable 
          onPress={saveProfile} 
          style={styles.saveBtn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveText}>Continue</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#0a0f1c",
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "600",
    marginTop: 40,
  },
  glow1: {
    position: "absolute",
    width: 250,
    height: 250,
    backgroundColor: "#007AFF",
    borderRadius: 150,
    opacity: 0.15,
    top: 80,
    left: -50,
  },
  glow2: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#ff3b30",
    borderRadius: 150,
    opacity: 0.1,
    bottom: 80,
    right: -50,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden", 
  },
  avatarText: {
    color: "#aaa",
    fontSize: 32,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 20,
  },
  section: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  kycBtn: {
    backgroundColor: "#6c2bd9",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  kycText: {
    color: "white",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
