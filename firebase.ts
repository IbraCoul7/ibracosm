import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnGTYNG9RFz9RidicWqttMNTRSWYdr8BA",
  authDomain: "ibracosm.firebaseapp.com",
  projectId: "ibracosm",
  storageBucket: "ibracosm.firebasestorage.app",
  messagingSenderId: "715850665185",
  appId: "1:715850665185:web:541fe68bfc8f0ded503ba0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);