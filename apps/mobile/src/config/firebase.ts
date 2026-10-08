import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyClBuj8koEYV2e57OrTyGdx6hrarrrwLNo",
  authDomain: "giaovienhay-511009.firebaseapp.com",
  projectId: "giaovienhay-511009",
  storageBucket: "giaovienhay-511009.firebasestorage.app",
  messagingSenderId: "114953235019",
  appId: "1:114953235019:web:6bcaefc200c07075d7bbce",
  measurementId: "G-HW2MXTX6VY",
};

// Initialize Firebase for Client App (Auth only - Database is SQL Data Connect)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
