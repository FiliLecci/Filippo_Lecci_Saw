import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "API-KEY",
  authDomain: "smartair-8fabf.firebaseapp.com",
  projectId: "smartair-8fabf",
  storageBucket: "smartair-8fabf.firebasestorage.app",
  messagingSenderId: "12180649959",
  appId: "1:12180649959:web:359e8b55af1b3412002f42"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
