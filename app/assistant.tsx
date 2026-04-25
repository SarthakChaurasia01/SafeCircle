import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

type Message = {
  text: string;
  sender: "You" | "Assistant";
};

// Advanced bot response database (easy to extend)
const botResponses: { [key: string]: string } = {
  // Original safety & threat responses
  unsafe: "Go to a crowded place, stay near people, and share your live location with someone trusted.",
  followed: "Do not go home. Change your pace, cross the street, and head to a well-lit, busy public place like a store, cafe, or police station. Call someone to meet you.",
  stalking: "Do not go home. Change your pace, cross the street, and head to a well-lit, busy public place like a store, cafe, or police station. Call someone to meet you.",
  harassment: "Move to a public place, record details if safe, and call someone trusted or local authorities.",
  danger: "Stay calm, move to safety, and alert nearby trusted people immediately.",
  defense: "Make loud noises to attract attention ('FIRE!' often works better than 'HELP!'). If grabbed, aim for vulnerable areas: eyes, nose, throat, or groin. Your goal is to escape.",
  defend: "Make loud noises to attract attention ('FIRE!' often works better than 'HELP!'). If grabbed, aim for vulnerable areas: eyes, nose, throat, or groin. Your goal is to escape.",

  // Mental health
  panic: "Take slow deep breaths. Inhale for 4 seconds, hold for 4 seconds, and exhale for 6 seconds. Focus on 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",

  // Logistics
  "emergency number": "Police: 100 | Ambulance: 102 | Women Helpline: 1091 | Fire: 101 | Cyber Crime: 1930",
  location: "Share your live location with a trusted contact via WhatsApp or SMS, and keep your phone charged.",
  "safe place": "Open the map and look for nearby police stations, hospitals, 24/7 stores, petrol pumps, or well-lit busy public places.",

  // Medical / First Aid
  bleeding: "Apply firm pressure on the wound using a clean cloth or bandage. Do not remove the cloth to check; if it soaks through, add another layer on top. Elevate the limb if possible.",
  burns: "Cool the burn under cool (not cold) running water for at least 10-15 minutes. Do not apply ice, butter, or toothpaste. Cover loosely with sterile gauze.",
  choking: "If they cannot cough, speak, or breathe, perform the Heimlich maneuver: stand behind them, make a fist just above their navel, and pull inward and upward quickly 5 times.",
  faint: "Lay the person on their back and elevate their legs. Loosen tight clothing. If they don't regain consciousness within a minute, call an ambulance.",
  "first aid": "Keep the person calm, ensure the area is safe, check breathing, and give only basic first aid until professional help arrives.",

  // Fire
  fire: "Evacuate immediately. Stay low to the ground to avoid inhaling smoke. Do not use elevators. Call the Fire Department (101) once you are safely outside.",

  // === NEW ADVANCED RESPONSES ===
  "heart attack": "Call ambulance (102) immediately. Sit or lay the person down comfortably. If they have prescribed aspirin, help them chew a 300mg tablet. Loosen tight clothing.",
  cpr: "Adult CPR: 30 chest compressions (5-6 cm deep, 100-120 per minute) + 2 rescue breaths. Use an AED if available. Continue until help arrives or the person starts breathing.",
  "snake bite": "Keep calm and immobilize the bitten limb. Do NOT cut, suck, or apply ice/tourniquet. Rush to the nearest hospital for antivenom immediately.",
  earthquake: "DROP, COVER, and HOLD ON under a sturdy table or against an interior wall. Stay away from windows, glass, and heavy furniture. After shaking stops, evacuate if the building is damaged.",
  accident: "Ensure scene safety first. Call 100 and 102. Do not move seriously injured people unless in immediate danger. Control bleeding and keep the victim warm.",
  crash: "Ensure scene safety first. Call 100 and 102. Do not move seriously injured people unless in immediate danger. Control bleeding and keep the victim warm.",
  seizure: "Do not restrain or put anything in their mouth. Clear the area around them. Time the seizure. After it ends, place them in recovery position. Call ambulance if it lasts >5 minutes.",
  poisoning: "Call 102 or poison control immediately. Note the substance and amount. Do NOT induce vomiting unless instructed by a medical professional.",
  heatstroke: "Move to shade, remove excess clothing, and cool the body with wet cloths or a fan. Give small sips of water if conscious. Seek urgent medical care.",
  "domestic violence": "You are not alone. Call Women Helpline 1091 or Police 100 immediately. Reach out to a trusted friend, family member, or shelter.",
  abuse: "You are not alone. Call Women Helpline 1091 or Police 100 immediately. Reach out to a trusted friend, family member, or shelter.",
  scam: "Do not engage further. Block and report the contact/platform. Never share OTP, bank details, or passwords. Report to cyber cell (1930).",
  "online safety": "Do not engage further. Block and report the contact/platform. Never share OTP, bank details, or passwords. Report to cyber cell (1930).",
  lost: "Stay calm and in a visible public place. Share your live location with family. Use landmarks to describe your position to help.",
  breakdown: "Activate hazard lights and stay inside the vehicle if safe. Call roadside assistance or a trusted person. Do not open the door to strangers at night.",
  "animal attack": "Stay calm, avoid eye contact, and back away slowly. Use any object as a barrier if needed. If bitten, clean the wound thoroughly and seek medical help immediately.",
};

export default function AssistantScreen() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Expanded quick options (more comprehensive safety topics)
  const quickOptions = [
    "I feel unsafe",
    "Being followed",
    "Panic help",
    "Emergency numbers",
    "Share location",
    "Harassment help",
    "Nearest safe place",
    "First aid for bleeding",
    "First aid for burns",
    "Someone is choking",
    "Fire emergency",
    "Self-defense tips",
    "What to do in danger",
    // New advanced quick options
    "Heart attack",
    "How to do CPR",
    "Snake bite first aid",
    "Earthquake safety",
    "Road accident",
    "Seizure first aid",
    "Poisoning help",
    "Heatstroke",
    "Domestic violence",
    "Online scam",
    "Lost in city",
    "Car breakdown at night",
    "Animal attack",
  ];

  const getBotReply = (text: string) => {
    const t = text.toLowerCase();

    // Check against the advanced response database
    for (const [keyword, reply] of Object.entries(botResponses)) {
      if (t.includes(keyword)) {
        return reply;
      }
    }

    return "Stay calm. I'm here to help with safety tips, first aid, emergencies, mental health, or any danger situation. Try one of the quick options above or describe exactly what’s happening!";
  };

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to the latest message (advanced chat UX)
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = (text?: string) => {
    const finalText = (text ?? msg).trim();
    if (!finalText) return;

    // Add user message immediately
    const userMsg: Message = { text: finalText, sender: "You" };
    setMessages((prev) => [...prev, userMsg]);
    setMsg("");

    // Simulate realistic bot thinking delay
    setTimeout(() => {
      const botMsg: Message = { text: getBotReply(finalText), sender: "Assistant" };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  const handleQuickPress = (option: string) => {
    sendMessage(option);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>🤖 Safety Assistant</Text>
      <Text style={styles.subHeader}>Tap a quick option or type your question</Text>

      {/* Quick options - horizontal scroll with more items */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
        {quickOptions.map((item) => (
          <Pressable
            key={item}
            style={styles.quickChip}
            onPress={() => handleQuickPress(item)}
          >
            <Text style={styles.quickText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Chat list with auto-scroll ref */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.sender === "You" ? styles.me : styles.bot]}>
            <Text style={styles.sender}>{item.sender}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        style={{ flex: 1 }}
      />

      {/* Input area */}
      <View style={styles.inputBox}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Ask something... (e.g. 'I'm having chest pain')"
          placeholderTextColor="#aaa"
          style={styles.input}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          multiline
        />

        <Pressable onPress={() => sendMessage()} style={styles.sendBtn}>
          <Text style={styles.send}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1c",
    padding: 12,
  },
  header: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  subHeader: {
    color: "#aaa",
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
  },
  quickRow: {
    maxHeight: 52,
    marginBottom: 12,
  },
  quickChip: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  quickText: {
    color: "white",
    fontSize: 13,
  },
  list: {
    paddingBottom: 20,
  },
  msg: {
    padding: 14,
    marginVertical: 6,
    borderRadius: 18,
    maxWidth: "85%",
  },
  me: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#333",
    borderBottomLeftRadius: 4,
  },
  sender: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  text: {
    color: "white",
    fontSize: 16,
    lineHeight: 22,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "white",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    maxHeight: 120,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  send: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});