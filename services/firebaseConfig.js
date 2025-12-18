// services/firebaseConfig.js

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Dán cấu hình từ Firebase Console vào dây
const firebaseConfig = {
  apiKey: "AIzaSyBSYqFoHi7_tcbbuJbJ-98Tv0HCYLXNxAo",
  authDomain: "appdulich-e282e.firebaseapp.com",
  projectId: "appdulich-e282e",
  storageBucket: "appdulich-e282e.firebasestorage.app",
  messagingSenderId: "451313908573",
  appId: "1:451313908573:web:5ed3fd5fe19e963339c6b4",
  measurementId: "G-04TXLM6VZ4"
};

// 2. Khởi tạo Firebase (Kiểm tra xem đã khởi tạo chưa)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 3. Khởi tạo các dịch vụ bạn cần
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // Nếu auth đã được khởi tạo rồi (do hot reload)
  if (error.code === 'auth/already-initialized') {
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };
export const db = getFirestore(app);

// export default app;