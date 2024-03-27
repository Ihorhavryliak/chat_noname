import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqzRhX914UlzWHBk36ILL1xNazjH_enAY",
  authDomain: "noname-4be0a.firebaseapp.com",
  projectId: "noname-4be0a",
  storageBucket: "noname-4be0a.appspot.com",
  messagingSenderId: "587742828978",
  appId: "1:587742828978:web:8059ee82834c03f2166cab",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

export { auth, googleAuthProvider, db };
