// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// SEU OBJETO DE CONFIGURAÇÃO DO FIREBASE VAI AQUI
const firebaseConfig = {
  apiKey: "AIzaSyB7GGijIfop9_47FCxnZYW1H6MmP4IZb1Y",
  authDomain: "rango-app-4ccbd.firebaseapp.com",
  projectId: "rango-app-4ccbd",
  storageBucket: "rango-app-4ccbd.firebasestorage.app",
  messagingSenderId: "481170586903",
  appId: "1:481170586903:web:12bc18eaa0acfc1a8e8b52",
  measurementId: "G-J6DK5GHZTF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que você vai usar
export const auth = getAuth(app);
export const db = getFirestore(app);