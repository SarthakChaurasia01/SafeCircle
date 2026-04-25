import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet
} from "react-native";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
const { alertId } = useLocalSearchParams();

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "../services/firebase";
import { getCurrentUserProfile } from "../services/userService"; // ✅ FIXED IMPORT

// ✅ TYPE
type Message = {
  text: string;
  sender: string;
  timestamp: number;
  alertId: string;
};

export default function Chat() {
  const params = useLocalSearchParams();

  // ✅ SAFE alertId handling
  const roomId = useMemo(() => {
    const raw = params.alertId;
    if (Array.isArray(raw)) return raw[0];
    return raw || "global";
  }, [params]);

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList<Message>>(null);

  const [currentUser, setCurrentUser] = useState("User");

  // ✅ LOAD USER PROFILE
  useEffect(() => {
    const load = async () => {
      const profile = await getCurrentUserProfile();
      if (profile?.name) setCurrentUser(profile.name);
    };
    load();
  }, []);

  // 📤 SEND MESSAGE
  const sendMessage = async () => {
    if (msg.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: msg.trim(),
      sender: currentUser,
      alertId: roomId,
      timestamp: Date.now()
    });

    setMsg("");
  };

  // 📥 RECEIVE MESSAGES
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => doc.data() as Message
      );

      const filtered = data.filter(
        (m) => (m.alertId || "global") === roomId
      );

      setMessages(filtered);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [roomId]);

  // 💬 RENDER
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === currentUser;

    return (
      <View style={[styles.msg, isMe ? styles.me : styles.other]}>
        <Text style={styles.sender}>{item.sender}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency Chat</Text>
      <Text style={styles.subHeader}>Room: {roomId}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputBox}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Type message..."
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <Text style={styles.send} onPress={sendMessage}>
          Send
        </Text>
      </View>
    </View>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 12
  },

  header: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4
  },

  subHeader: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 10
  },

  listContent: {
    paddingBottom: 12
  },

  msg: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "75%"
  },

  me: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF"
  },

  other: {
    alignSelf: "flex-start",
    backgroundColor: "#333"
  },

  sender: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 2
  },

  text: {
    color: "white",
    fontSize: 16
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10
  },

  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "white",
    padding: 12,
    borderRadius: 10
  },

  send: {
    color: "#007AFF",
    fontWeight: "bold",
    paddingHorizontal: 6
  }
});