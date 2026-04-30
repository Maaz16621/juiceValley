// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9Mk46DBW7AraNtPCF-7_hdGaQJV5YQo4",
  authDomain: "juicevalley-33052.firebaseapp.com",
  projectId: "juicevalley-33052",
  storageBucket: "juicevalley-33052.firebasestorage.app",
  messagingSenderId: "645417254260",
  appId: "1:645417254260:web:101406849e9e9297cd0021",
  measurementId: "G-E049XN01PQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, firestore, storage, functions };
