// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'; // <-- Descomentar/Adicionar
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'; // <-- Descomentar/Adicionar

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verificar se todas as configurações necessárias estão presentes
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingConfig = requiredConfig.filter(key => {
  const value = firebaseConfig[key as keyof typeof firebaseConfig];
  return !value || value === 'undefined' || value === 'null';
});

if (missingConfig.length > 0) {
  console.error('❌ Configurações do Firebase ausentes:', missingConfig);
  console.error('Configure as seguintes variáveis de ambiente:');
  missingConfig.forEach(config => {
    console.error(`- VITE_FIREBASE_${config.toUpperCase()}`);
  });
  throw new Error(`Configurações do Firebase ausentes: ${missingConfig.join(', ')}`);
}

// Inicializar Firebase
let app; // Use 'let' se você for reatribuir 'app' ou se estiver dentro de um bloco try/catch
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado com sucesso');
  console.log('📊 Projeto:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  throw error;
}

// Obter referências dos serviços (DESCOMENTE ESTAS LINHAS!)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // <-- Descomentar/Adicionar se você usa

// Configurar o provider do Google (DESCOMENTE ESTE BLOCO SE VOCÊ USA)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Para desenvolvimento local, você pode descomentar as linhas abaixo para usar emuladores (DESCOMENTE SE VOCÊ USA)
// if (import.meta.env.DEV) {
//    try {
//      connectAuthEmulator(auth, 'http://localhost:9099');
//      connectFirestoreEmulator(db, 'localhost', 8080);
//    } catch (error) {
//      console.log('Emuladores já conectados ou não disponíveis');
//    }
// }

export default app; // Mantém a exportação padrão do app