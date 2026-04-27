# 🛡️ SafeCircle

### Community-Based Emergency Response & AI Guidance Platform

SafeCircle bridges the critical gap between victims and nearby volunteers during emergencies. Built for the **Build with AI / Hack2Skill Solution Challenge**, this platform leverages real-time cloud data and advanced AI to ensure **no call for help goes unanswered**.

---

## ✨ Key Features

### 🚨 1-Tap SOS Proximity Alerts

Instantly extracts precise GPS coordinates and alerts nearby registered volunteers in real-time.

### 🗺️ Smart Safe Routing

Displays the fastest and safest routes for volunteers using real-time geolocation data.

### 🧠 Universal Safety Assistant

Powered by **Google Gemini 2.5 Flash**, delivering instant, structured emergency guidance and survival instructions during high-stress situations.

### ⚡ Zero-Latency Dispatch

Utilizes **Firebase Firestore (NoSQL)** for real-time syncing of emergency events across all devices.

---

## 🛠️ Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| **Frontend**  | React Native (TypeScript), Expo |
| **Backend**   | Firebase (Firestore, FCM)       |
| **AI Engine** | Google Gemini 2.5 Flash API     |
| **APIs Used** | Expo Location, Expo Camera      |

---

## 🧱 Architecture Overview

* 📱 **Mobile Client** → React Native (Expo)
* ☁️ **Cloud Backend** → Firebase Firestore (real-time state)
* 🔔 **Notifications** → Firebase Cloud Messaging (FCM)
* 🤖 **AI Processing** → Gemini API for natural language emergency assistance
* 📍 **Geolocation** → Expo Location APIs

---

## 🚀 Getting Started (Run Locally)

> ⚠️ **Recommended:** Use a real mobile device with Expo Go for best performance.

---

### 📲 Step 1: Prepare Your Mobile Device

1. Install **Expo Go**:

   * iOS → App Store
   * Android → Google Play Store

2. Open the app and:

   * Create a free account OR log in

---

### 💻 Step 2: Setup Local Environment

Ensure you have the following installed:

* Node.js (v16+ recommended)
* npm or yarn

Clone the repository:

```bash
git clone https://github.com/SarthakChaurasia01/SafeCircle.git
cd SafeCircle
```

Install dependencies:

```bash
npm install
```

---

### ▶️ Step 3: Run the App

Start the Expo development server:

```bash
npm start --go
```

This will generate a **QR Code**.

---

### 📷 Step 4: Launch on Your Phone

* **iOS:**
  Open Camera → Scan QR → Tap *Open in Expo Go*

* **Android:**
  Open Expo Go → Tap *Scan QR Code* → Scan the code

Your app will launch instantly 🚀

---

## ⚠️ APK (MVP) Limitation

If you are testing the provided standalone APK:

* ❌ Google Maps rendering is **disabled**
* ✅ SOS alerts, geolocation, and AI assistant are **fully functional**

### Why?

Due to Google Maps API requiring a **production billing-enabled key**, map rendering is bypassed to prevent crashes.

---

## 🎥 Demo

👉 Watch the **3-Minute Demo Video** (recommended for judges)

---

## 🧑‍💻 Developer

**Sarthak Chaurasia**
Built for the **Hack2Skill Solution Challenge**

---

## 💡 Vision

SafeCircle aims to build a **decentralized, community-driven safety net**, where anyone in distress can instantly connect with nearby help — powered by AI and real-time data.

---

## 📌 Future Improvements

* 🔐 Verified volunteer identity system
* 🧭 AI-based danger zone prediction
* 📡 Offline SOS mesh networking
* 🏥 Integration with emergency services

---

## 📄 License

This project is currently for **hackathon/demo purposes**. Licensing will be updated in future releases.

---

## ⭐ Support

If you found this project impactful, consider giving it a ⭐ on GitHub!

---
