import { View, Button, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import { useRef, useState, useEffect } from "react";

export default function RecordScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  if (!permission) {
    return <Text>Loading...</Text>;
  }

  if (!permission.granted) {
    return <Button title="Allow Camera" onPress={requestPermission} />;
  }

  const startRecording = async () => {
    try {
      if (cameraRef.current) {
        setRecording(true);

        const video = await cameraRef.current.recordAsync();
        console.log("Video:", video.uri);

        setRecording(false);
      }
    } catch (err) {
      console.log("Error:", err);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        ref={cameraRef}
        facing="back"
      />

      <Button
        title={recording ? "Stop" : "Record"}
        onPress={recording ? stopRecording : startRecording}
      />
    </View>
  );
}