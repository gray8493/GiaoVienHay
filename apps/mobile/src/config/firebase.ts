import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyATfD-5iZn_2X9eAMU9dl1t6WcDT_xA34M",
  authDomain: "giaovienhay.firebaseapp.com",
  projectId: "giaovienhay",
  storageBucket: "giaovienhay.firebasestorage.app",
  messagingSenderId: "15041699969",
  appId: "1:15041699969:web:7e8d4728499d656cb0ed80",
  measurementId: "G-9TF55K3ZRF",
};

// Initialize Firebase for Client App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
