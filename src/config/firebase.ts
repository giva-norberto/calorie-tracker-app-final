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
// Importe as funções que você precisa do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// 1. Defina a configuração para ler as variáveis de ambiente do Vite
// O Vite expõe variáveis de ambiente no objeto import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
};

// 2. Validação para garantir que as variáveis foram carregadas
// Isso ajuda a identificar erros rapidamente
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);
// Importe as funções que você precisa do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// 1. Defina a configuração para ler as variáveis de ambiente do Vite
// O Vite expõe variáveis de ambiente no objeto import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
};

// 2. Validação para garantir que as variáveis foram carregadas
// Isso ajuda a identificar erros rapidamente
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingConfig = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  const errorMsg = `❌ Configurações do Firebase ausentes: ${missingConfig.join(', ')}. Verifique seus GitHub Secrets.`;
  console.error(errorMsg);
  // Lançar um erro impede que o resto do app tente rodar sem configuração
  throw new Error(errorMsg);
}

// 3. Inicialize o Firebase e os serviços
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado com sucesso');
  console.log('📊 Projeto:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  throw error;
}

// Exporte as referências dos serviços que você usa no seu aplicativo
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configura o prompt de seleção de conta para o login com Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// A exportação padrão do app pode ser útil em alguns casos
export default app;
