import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "API-KEY",
  authDomain: "smartair-8fabf.firebaseapp.com",
  projectId: "smartair-8fabf",
  storageBucket: "smartair-8fabf.firebasestorage.app",
  messagingSenderId: "12180649959",
  appId: "1:12180649959:web:359e8b55af1b3412002f42"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app, 'us-central1');
const provider = new GoogleAuthProvider();
const auth = getAuth();

if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, "localhost", 5002);
}

export {db, auth, functions, provider};