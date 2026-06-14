import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// 🔥 NHỚ THÊM getDocs VÀO ĐÂY ĐỂ LẤY TỪ FIRESTORE GỐC
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyDutjeAHKoDZeRO9STucx1qMGnNoQIvbpw",
  authDomain: "to-do-b487a.firebaseapp.com",
  projectId: "to-do-b487a",
  storageBucket: "to-do-b487a.firebasestorage.app",
  messagingSenderId: "474768160717",
  appId: "1:474768160717:web:86ebc64a33daa3ac2cf684"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getDocs };