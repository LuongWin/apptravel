// services/firebaseConfig.js

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // N?u b?n d�ng Firestore

// 1. D�n c?u h?nh t? Firebase Console v�o ��y
const firebaseConfig = {
  apiKey: "AIzaSyBSYqFoHi7_tcbbuJbJ-98Tv0HCYLXNxAo",
  authDomain: "appdulich-e282e.firebaseapp.com",
  databaseURL: "https://appdulich-e282e-default-rtdb.firebaseio.com",
  projectId: "appdulich-e282e",
  storageBucket: "appdulich-e282e.firebasestorage.app",
  messagingSenderId: "451313908573",
  appId: "1:451313908573:web:5ed3fd5fe19e963339c6b4",
  measurementId: "G-04TXLM6VZ4"
};

// 2. Kh?i t?o Firebase
const app = initializeApp(firebaseConfig);

// 3. Kh?i t?o c�c d?ch v? b?n c?n (v� d?: Auth v� Firestore)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // N?u auth �� ��?c kh?i t?o r?i (v� d?: do hot reload)
  if (error.code === 'auth/already-initialized') {
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };
export const db = getFirestore(app);

// Xu?t c�c �?i t�?ng �? ��?c kh?i t?o �? s? d?ng trong to�n b? ?ng d?ng
// export default app;