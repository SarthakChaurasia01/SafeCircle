import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loadContacts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Pull contacts from this specific user's subcollection
      const snapshot = await getDocs(collection(db, "users", user.uid, "emergency_contacts"));
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(loaded);
    } catch (error) {
      console.log("Error loading contacts", error);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const addContact = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Please enter name and phone number");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "users", user.uid, "emergency_contacts"), {
        name,
        phone,
        timestamp: Date.now()
      });

      setName("");
      setPhone("");
      loadContacts(); // Refresh list
    } catch (error) {
      Alert.alert("Error", "Could not add contact");
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(doc(db, "users", user.uid, "emergency_contacts", contactId));
      loadContacts();
    } catch (error) {
      console.log("Error deleting", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts 📞</Text>

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Name (e.g. Mom)" 
          placeholderTextColor="#888"
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Phone Number" 
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phone} 
          onChangeText={setPhone} 
        />
        <Pressable style={styles.btn} onPress={addContact}>
          <Text style={styles.btnText}>Add Contact</Text>
        </Pressable>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <Pressable onPress={() => deleteContact(item.id)}>
              <Text style={styles.deleteBtn}>❌</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1c", padding: 20, paddingTop: 60 },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: "#1e1e1e", color: "white", padding: 15, borderRadius: 10, marginBottom: 10 },
  btn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center" },
  btnText: { color: "white", fontWeight: "bold" },
  contactCard: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#1e1e1e", padding: 15, borderRadius: 10, marginBottom: 10 },
  contactName: { color: "white", fontWeight: "bold", fontSize: 16 },
  contactPhone: { color: "#aaa", marginTop: 5 },
  deleteBtn: { fontSize: 20 }
});