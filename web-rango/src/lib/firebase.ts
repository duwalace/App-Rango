import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase - Mesmo projeto do app-rango
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

// Exporta os serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
