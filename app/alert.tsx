import { View, Text, StyleSheet } from "react-native";

export default function AlertScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Alert Sent</Text>
      <Text style={styles.text}>Sending alert...</Text>
      <Text style={styles.text}>Location shared</Text>
      <Text style={styles.text}>Nearby users notified</Text>
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
    color: "red",
    fontSize: 26,
    marginBottom: 20,
  },
  text: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
});