import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyClBuj8koSyClBuj8ko6",
  projectId: "giaovienhay-fcm",
  storageBucket: "giaovienhay-fcm.firebasestorage.app",
  messagingSenderId: "108576935685937885482",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:108576935685937885482:web:giaovienhay",
};

// Initialize Firebase for Client App (Auth only - Database is SQL Data Connect)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
