import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Dán cái đoạn config bạn copy từ Firebase Console vào đây
const firebaseConfig = {
  apiKey: "AIzaSyBUio-cLulmB_gItV-mODGAUJmOmkh2RU8",
  authDomain: "testtraveloka-e16ea.firebaseapp.com",
  projectId: "testtraveloka-e16ea",
  storageBucket: "testtraveloka-e16ea.firebasestorage.app",
  messagingSenderId: "260462046702",
  appId: "1:260462046702:web:f6f7dab1203d18ed9232ff",
  measurementId: "G-G11Y84LBJE",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
