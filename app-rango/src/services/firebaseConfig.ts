// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase - Projeto: apprango-81562
const firebaseConfig = {
  apiKey: "AIzaSyA-qPqdBBchmdFcqV4yjTn2ZM3LUO8OobI",
  authDomain: "apprango-81562.firebaseapp.com",
  projectId: "apprango-81562",
  storageBucket: "apprango-81562.firebasestorage.app",
  messagingSenderId: "50042762219",
  appId: "1:50042762219:web:d873994104609ecbcc5fae",
  measurementId: "G-KFTWJPB3KE"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🔥 Firebase inicializado');

export { auth, db };