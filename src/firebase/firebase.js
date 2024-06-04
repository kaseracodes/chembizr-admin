// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPHFrCvy5OyQFxf_Cul6-529NuWkOyBfs",
  authDomain: "chembizr-13d5a.firebaseapp.com",
  projectId: "chembizr-13d5a",
  storageBucket: "chembizr-13d5a.appspot.com",
  messagingSenderId: "617645771031",
  appId: "1:617645771031:web:36215842114a7cecddcf52",
  measurementId: "G-SB711LNF6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const firestore = getFirestore()
const storage = getStorage()

export { app, auth, firestore, storage };