import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy
} from "firebase/firestore";

const isProductionDomain = window.location.hostname === "www.prephas.online" || window.location.hostname === "prephas.online";
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isProductionDomain 
    ? "www.prephas.online" 
    : (isLocalhost ? "prephas.firebaseapp.com" : (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "prephas.firebaseapp.com")),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export let auth = null;
export let db = null;
export let googleProvider = null;
export let isFirebaseConfigured = true;

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (!apiKey || apiKey === "your_key_here") {
  isFirebaseConfigured = false;
  console.warn("Firebase credentials are not configured. Application will display configuration notice.");
} else {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    isFirebaseConfigured = false;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy
};
