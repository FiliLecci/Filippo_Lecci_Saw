import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey            : import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain        : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId         : import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket     : import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId : import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId             : import.meta.env.VITE_APP_ID
};

const app       = initializeApp(firebaseConfig);
const db        = getFirestore(app);
const functions = getFunctions(app );
const provider  = new GoogleAuthProvider();
const auth      = getAuth();

if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, "localhost", 5002);
}

export {app, db, auth, functions, provider};