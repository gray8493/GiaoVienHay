import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase Web App credentials (giá trị mặc định = cấu hình thật của dự án,
// override được qua biến môi trường EXPO_PUBLIC_* nếu cần đổi project)
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDwAj1VMYoMsU-nFf-6ldNU9E0HqZc4PSk',
  authDomain: 'giaovienhay-fcm.firebaseapp.com',
  projectId: 'giaovienhay-fcm',
  storageBucket: 'giaovienhay-fcm.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '82319186886',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:82319186886:web:9960d986874dcb66c570c7',
};

// Initialize Firebase for Client App (Auth + Cloud Messaging - Database is SQL Data Connect)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
