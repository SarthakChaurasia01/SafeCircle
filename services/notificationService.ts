import * as Device from "expo-device";

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    alert("Use real device");
    return null;
  }

  console.log("Push notifications are disabled in this app.");

  return null;
};