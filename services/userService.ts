import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const getCurrentUserProfile = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log("No user logged in");
      return null;
    }

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data();
    }

    return null;
  } catch (err) {
    console.log("User fetch error:", err);
    return null;
  }
};

export const getCurrentUserProfileV2 = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.log(err);
    return null;
  }
};