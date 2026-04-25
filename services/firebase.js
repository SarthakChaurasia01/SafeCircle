import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";




// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBmGeRxvuBJQkT15FYPdR3dL8B_2MakjFU",
  authDomain: "safecircle-236ce.firebaseapp.com",
  projectId: "safecircle-236ce",
  storageBucket: "safecircle-236ce.firebasestorage.app",
  messagingSenderId: "10585903551",
  appId: "1:10585903551:web:bbf07e44451f590e84d10a"
};

// ✅ INITIALIZE APP ONLY ONCE
const app = initializeApp(firebaseConfig);

// ✅ EXPORT SERVICES
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ✅ ADD THIS

