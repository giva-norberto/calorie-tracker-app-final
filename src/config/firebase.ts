// Importe as funções que você precisa do Firebase no topo do arquivo
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// 1. Defina a configuração para ler as variáveis de ambiente do Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
};

// 2. Validação para garantir que as variáveis foram carregadas
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  const errorMsg = `❌ Configurações do Firebase ausentes: ${missingConfig.join(', ')}. Verifique seus GitHub Secrets.`;
  console.error(errorMsg);
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
