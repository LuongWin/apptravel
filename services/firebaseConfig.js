// services/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // N?u b?n dùng Authentication
import { getFirestore } from 'firebase/firestore'; // N?u b?n dùng Firestore

// 1. Dán c?u h?nh t? Firebase Console vào ðây
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

// 3. Kh?i t?o các d?ch v? b?n c?n (ví d?: Auth và Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);

// Xu?t các ð?i tý?ng ð? ðý?c kh?i t?o ð? s? d?ng trong toàn b? ?ng d?ng
// export default app;