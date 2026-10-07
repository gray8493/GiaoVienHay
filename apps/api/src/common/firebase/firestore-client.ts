import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

export const FIREBASE_WEB_CONFIG = {
  apiKey: 'AIzaSyATfD-5iZn_2X9eAMU9dl1t6WcDT_xA34M',
  authDomain: 'giaovienhay.firebaseapp.com',
  projectId: 'giaovienhay',
  storageBucket: 'giaovienhay.firebasestorage.app',
  messagingSenderId: '15041699969',
  appId: '1:15041699969:web:7e8d4728499d656cb0ed80',
  measurementId: 'G-9TF55K3ZRF',
};

let firestoreInstance: Firestore | null = null;

export function getAppFirestore(): Firestore {
  if (!firestoreInstance) {
    const app = getApps().length === 0 ? initializeApp(FIREBASE_WEB_CONFIG) : getApps()[0];
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
};
