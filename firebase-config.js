// firebase-config.js
// Mengambil fungsi Firebase langsung dari internet (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; // 👈 Tambah ini untuk Database

const firebaseConfig = {
  apiKey: "AIzaSyDh49hxPWedLMHE9FFocTSV40Y5nbLSc-4",
  authDomain: "dasbord-resmiin.firebaseapp.com",
  projectId: "dasbord-resmiin",
  storageBucket: "dasbord-resmiin.firebasestorage.app",
  messagingSenderId: "1053625176143",
  appId: "1:1053625176143:web:dfd2f3af0d29d729af5a3a",
  measurementId: "G-MJK89PJX3B"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inisialisasi Firestore Database
const db = getFirestore(app);

// Export 'db' agar bisa dipakai di script.js atau file lainnya
export { db };
