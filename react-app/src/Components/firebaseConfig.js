import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "siofokszallas-675c8.firebaseapp.com",
  projectId: "siofokszallas-675c8",
  storageBucket: "siofokszallas-675c8.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);