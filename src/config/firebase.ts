// src/firebase.ts

// Importe as funções que você precisa dos SDKs do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// A configuração do seu projeto Firebase
// NOTA: Manter chaves de API no código-fonte pode ser um risco de segurança em produção.
// Considere usar variáveis de ambiente para projetos públicos.
const firebaseConfig = {
  apiKey: "AIzaSyAWQrYTGa5gXiMzHygx8RbHQnkgyg8etcQ",
  authDomain: "meu-app-calorias-v2.firebaseapp.com",
  projectId: "meu-app-calorias-v2",
  storageBucket: "meu-app-calorias-v2.appspot.com",
  messagingSenderId: "837794920446",
  appId: "1:837794920446:web:38bd8cf44204a2895932af",
  measurementId: "G-HEVYW559SP"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte as referências dos serviços que você usará na sua aplicação
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configura o prompt de seleção de conta para o login com o Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// A exportação padrão do app pode ser útil para outros serviços do Firebase
export default app;
