import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdg9SR61NZ88pl4AG5THjjIZ8-NfZUIlU",
  authDomain: "powerplay-owner-dashboard.firebaseapp.com",
  projectId: "powerplay-owner-dashboard",
  storageBucket: "powerplay-owner-dashboard.firebasestorage.app",
  messagingSenderId: "728982334095",
  appId: "1:728982334095:web:28658cd59421084e959efa",
  measurementId: "G-0LJXXQTBY0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db: Firestore = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

export default app;