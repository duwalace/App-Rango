/**
 * Script para criar usuário Dono do Site (Super Admin)
 * 
 * COMO USAR:
 * 
 * 1. Via Firebase Console (MAIS FÁCIL):
 *    - Vá em Firebase Console > Authentication
 *    - Crie um usuário com email/senha
 *    - Copie o UID do usuário
 *    - Vá em Firestore > Coleção "users"
 *    - Crie um documento com o UID do usuário
 *    - Adicione os campos do JSON abaixo
 * 
 * 2. Via código (este arquivo):
 *    - Descomente as linhas abaixo
 *    - Execute: npm run dev
 *    - Acesse a página /seed e rode esta função no console
 */

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export async function createAdminUser(
  email: string,
  password: string,
  name: string = 'Super Admin'
) {
  try {
    console.log('🔵 Criando usuário admin...');
    
    // 1. Criar usuário no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Usuário criado no Authentication. UID:', user.uid);
    
    // 2. Criar documento no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      nome: name,
      role: 'dono_do_site',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Documento criado no Firestore');
    console.log('🎉 Usuário admin criado com sucesso!');
    console.log('📋 Email:', email);
    console.log('📋 UID:', user.uid);
    console.log('📋 Role: dono_do_site');
    
    return {
      success: true,
      uid: user.uid,
      email: email,
      message: 'Usuário admin criado com sucesso!'
    };
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário admin:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * JSON para criar manualmente no Firestore:
 * 
 * Documento ID: [UID do usuário do Authentication]
 * 
 * {
 *   "uid": "[UID do usuário]",
 *   "email": "admin@rappy.com",
 *   "nome": "Super Admin",
 *   "role": "dono_do_site",
 *   "createdAt": [Timestamp atual],
 *   "updatedAt": [Timestamp atual]
 * }
 */

// Para usar este script:
// 1. Importe e chame a função:
//    import { createAdminUser } from '@/utils/createAdminUser';
//    createAdminUser('admin@rappy.com', 'SenhaForte123!', 'Super Admin');

export default createAdminUser;

