import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { askGemini } from "../services/geminiService";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 🚨 Emergency-focused quick options
  const quickOptions = [
    "What should I do in a road accident?",
    "How to give CPR step by step?",
    "I feel unsafe, what should I do?",
    "How to help an unconscious person?",
    "How to stop bleeding quickly?",
    "Emergency numbers in India",
    "What to do during fire emergency?"
  ];

  // 🔥 Initial greeting
  useEffect(() => {
    const initialGreeting = {
      id: Date.now(),
      text: "🚨 SafeCircle AI Active\n\nI’m here to help you in emergencies.\nAsk anything related to safety, medical help, or danger situations.",
      type: "bot",
    };
    setMessages([initialGreeting]);
  }, []);

  // 🔽 Auto scroll
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // 🚀 Send message
  const sendMessage = async (textToUse?: string) => {
    const finalInput = textToUse || input;
    if (!finalInput.trim()) return;

    setInput("");

    const userMsg = {
      id: Date.now(),
      text: finalInput,
      type: "user"
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 🧠 Emergency AI mode
    const reply = await askGemini(
      `You are an emergency assistant. Give short, clear, life-saving instructions.\n\nUser: ${finalInput}`
    );

    const botMsg = {
      id: Date.now() + 1,
      text: reply,
      type: "bot"
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  // 🧠 Format text (bold/italic)
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return (
      <Text style={styles.messageText}>
        {parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <Text key={index} style={styles.boldText}>
                {part.slice(2, -2)}
              </Text>
            );
          } else if (part.startsWith("*") && part.endsWith("*")) {
            return (
              <Text key={index} style={styles.italicText}>
                {part.slice(1, -1)}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      {/* 🔷 HEADER */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>🚨 SafeCircle AI</Text>
        <Text style={styles.headerSubtitle}>
          Emergency Assistant • Always Active
        </Text>
      </View>

      {/* 🚨 QUICK HELP BUTTON */}
      <Pressable
        style={styles.quickHelp}
        onPress={() =>
          sendMessage("I am in danger help me immediately")
        }
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          🚨 QUICK HELP
        </Text>
      </Pressable>

      {/* 🔘 QUICK OPTIONS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
        {quickOptions.map((item, index) => (
          <Pressable
            key={index}
            style={styles.quickChip}
            onPress={() => sendMessage(item)}
            disabled={isTyping}
          >
            <Text style={styles.quickText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 💬 CHAT */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.type === "user" ? styles.user : styles.bot,
            ]}
          >
            <Text style={styles.label}>
              {item.type === "user" ? "YOU" : "AI"}
            </Text>
            {renderFormattedText(item.text)}
          </View>
        )}
      />

      {/* ⏳ TYPING */}
      {isTyping && (
        <View style={styles.typingBox}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.typingText}>Analyzing situation...</Text>
        </View>
      )}

      {/* ✍ INPUT */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Describe your situation..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          style={styles.input}
          editable={!isTyping}
          onSubmitEditing={() => sendMessage()}
        />

        <Pressable
          onPress={() => sendMessage()}
          style={styles.sendBtn}
          disabled={isTyping}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1c",
    padding: 10,
  },

  headerBox: {
    alignItems: "center",
    marginBottom: 10,
  },

  headerTitle: {
    color: "#007AFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#aaa",
    fontSize: 12,
  },

  quickHelp: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  quickRow: {
    marginBottom: 10,
  },

  quickChip: {
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },

  quickText: {
    color: "white",
    fontSize: 12,
  },

  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },

  user: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },

  bot: {
    backgroundColor: "#222",
    alignSelf: "flex-start",
  },

  label: {
    fontSize: 10,
    color: "#ccc",
    marginBottom: 3,
  },

  messageText: {
    color: "white",
    fontSize: 15,
  },

  boldText: {
    fontWeight: "bold",
    color: "#00ffcc",
  },

  italicText: {
    fontStyle: "italic",
    color: "#ff00ff",
  },

  typingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  typingText: {
    color: "#aaa",
    marginLeft: 8,
  },

  inputBox: {
    flexDirection: "row",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "white",
    padding: 10,
    borderRadius: 10,
  },

  sendBtn: {
    backgroundColor: "#007AFF",
    padding: 10,
    marginLeft: 10,
    borderRadius: 10,
    justifyContent: "center",
  },

  sendText: {
    color: "white",
    fontWeight: "bold",
  },
});