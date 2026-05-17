import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB9LcjmeNEcwQTsR6w7E16c8Sb9IiSs0eI",
    authDomain: "rubrics-proyect-71ecd.firebaseapp.com",
    projectId: "rubrics-proyect-71ecd",
    storageBucket: "rubrics-proyect-71ecd.firebasestorage.app",
    messagingSenderId: "146883505448",
    appId: "1:146883505448:web:387d30f3bdabd35e13f41d",
    measurementId: "G-TS45NZ26XP",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export default app;