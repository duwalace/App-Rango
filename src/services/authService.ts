// src/services/authService.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig"; // Ajuste o caminho se necessário

// Tipos para os papéis
export type UserRole = 'cliente' | 'entregador' | 'dono_da_loja' | 'admin';

// Função de Cadastro
export const signUp = async (nome: string, email: string, password: string, role: UserRole) => {
  try {
    // 1. Cria o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Salva as informações adicionais (incluindo o papel) no Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      nome: nome,
      email: user.email,
      role: role,
      criadoEm: new Date()
    });

    return { user, role };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    throw error;
  }
};

// Função de Login
export const signIn = async (email: string, password: string) => {
  try {
    // 1. Autentica o usuário com o Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Busca o documento do usuário no Firestore para pegar o papel (role)
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { user, role: userData.role as UserRole };
    } else {
      // Isso não deveria acontecer em um fluxo normal
      throw new Error("Usuário não encontrado no banco de dados.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};