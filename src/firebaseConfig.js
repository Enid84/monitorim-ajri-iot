// src/firebaseConfig.js

// Import the core Firebase app initialization function
import { initializeApp } from "firebase/app";

// Import specific functions from the Realtime Database module
import {
  getDatabase, // To get the database instance
  ref,         // To create references to database locations
  onValue,     // To listen for real-time data changes
  get,         // To fetch data once
  child,       // To navigate database paths (less common with ref, but good to have)
  query,       // To build complex queries
  orderByChild,// For ordering query results
  limitToLast  // For limiting query results
} from "firebase/database";

// Import specific functions from the Authentication module
import {
  getAuth,             // To get the authentication instance
  signInWithEmailAndPassword // To sign in users with email and password
} from "firebase/auth";

// Optional: Import Analytics if you intend to use it.
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy1TBeh3cPhpwNcHDnYyJZw-Fhr-be70c",
  authDomain: "kualitet-ajri-v2.firebaseapp.com",
  databaseURL: "https://kualitet-ajri-v2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kualitet-ajri-v2",
  storageBucket: "kualitet-ajri-v2.firebasestorage.app",
  messagingSenderId: "406122383173",
  appId: "1:406122383173:web:5ee2753eabb95310ff602c",
  measurementId: "G-CDQGKNZDM0" // This is optional, for Firebase Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);         // Get the Auth service instance
const database = getDatabase(app); // Get the Realtime Database service instance
// const analytics = getAnalytics(app); // Get the Analytics service instance (uncomment if needed)

// Export all the initialized services and functions needed in other parts of your app
export {
  auth,
  database,
  // analytics, // Uncomment if you are using analytics
  ref,
  onValue,
  get,
  child,
  query,
  orderByChild,
  limitToLast,
  signInWithEmailAndPassword // Make sure this is explicitly exported
};