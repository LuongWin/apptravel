// configs/firebaseConfig.ts (hoặc services/firebaseConfig.ts)
import { initializeApp } from "firebase/app";
// Quan trọng: Phải import hàm này
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

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

// Sửa lại đoạn này để khớp với phiên bản mới
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
