# 🛡️ SafeCircle
**A Community-Based Emergency Response & AI Guidance Platform**

SafeCircle bridges the critical gap between victims and nearby volunteers during emergencies. Built for the **Build with AI / Hack2Skill Solution Challenge**, this platform leverages real-time cloud data and advanced AI to ensure no call for help goes unanswered.

---

## ✨ Key Features
* **🚨 1-Tap SOS Proximity Alerts:** Instantly extracts precise GPS coordinates and alerts nearby registered volunteers.
* **🗺️ Smart Safe Routing:** Visualizes the fastest, safest paths for volunteers to reach the victim using real-time geolocation.
* **🧠 Universal Safety Assistant:** Powered by Google Gemini 2.5 Flash, providing instant, formatted natural language triage and survival guidance during high-stress situations.
* **⚡ Zero-Latency Dispatch:** Uses NoSQL document syncing to update the community dashboard in real-time.

---

## 🛠️ Tech Stack & Architecture
* **Frontend:** React Native (TypeScript), Expo 
* **Backend:** Google Firebase (Firestore for NoSQL state management, FCM for push notifications)
* **AI Engine:** Google Gemini 2.5 Flash API (Real-time Natural Language Processing)
* **Hardware Integration:** Expo Location APIs, Expo Camera APIs

---

## 🚀 How to Run the App Locally (For Judges & Evaluators)

Due to our heavy integration of native hardware APIs (Geolocation Maps, Accelerometer, and Camera), the absolute best way to test the full, flawless functionality of SafeCircle is via the **Expo Go** mobile client. 

Please follow these precise steps to run the working prototype on your physical mobile device:

### Step 1: Prepare Your Mobile Device
1. **Download the App:** Download the **"Expo Go"** app on your physical mobile phone from the [Apple App Store](https://apps.apple.com/us/app/expo-go/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. **Create an Account:** Open the Expo Go app on your phone and quickly create a free account (or log in if you already have one).

### Step 2: Prepare Your Local Environment
1. Ensure you have [Node.js](https://nodejs.org/) installed on your computer.
2. Clone this repository to your local machine:
   ```bash
   git clone [https://github.com/SarthakChaurasia01/SafeCircle.git](https://github.com/SarthakChaurasia01/SafeCircle.git)
   cd SafeCircle
Install the project dependencies:

Bash
npm install
Step 3: Launch the Application
Start the Expo development server by forcing the Expo Go configuration. Run this exact command in your terminal:

Bash
npm start --go
A large QR Code will generate in your terminal (and a browser window may open displaying the same QR code).

Scan the QR Code:

On iOS: Open your iPhone's default Camera app and point it at the QR code. Tap the "Open in Expo Go" notification that appears at the top of your screen.

On Android: Open the Expo Go app, tap "Scan QR Code" on the home screen, and point it at your computer screen.

The app will bundle the JavaScript code and launch SafeCircle directly on your phone!

⚠️ Important Note Regarding the Standalone APK (MVP)
If you are testing the direct .apk installation file provided in our submission:
Due to strict native Android Maps API constraints in the standalone build, the visual map rendering has been temporarily bypassed in the APK to prevent startup crashes (as it requires a production Google Cloud API billing key).

However, full geolocation, SOS proximity routing, and Gemini AI integrations are completely functional in the development environment. To see the map working perfectly, please run the app via the Expo Go instructions above or review our 3-Minute Demo Video!

Developed by Sarthak for the Hack2Skill Solution Challenge.
