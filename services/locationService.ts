import * as Location from "expo-location";

export async function getUserLocation() {

  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  };
}import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// 🔥 GET CURRENT USER PROFILE
export const getCurrentUserProfile = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log("❌ No user logged in");
      return null;
    }

    const docRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      console.log("⚠️ User profile not found");
      return null;
    }
  } catch (error) {
    console.log("❌ Error fetching user:", error);
    return null;
  }
};