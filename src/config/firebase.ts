// Importe as funções que precisa do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// AQUI ESTÁ A CORREÇÃO: As chaves do seu projeto NOVO estão diretamente no código.
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

// Exporte as referências dos serviços que usa na sua aplicação
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configura o prompt de seleção de conta para o login com o Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// A exportação padrão da app pode ser útil em alguns casos
export default app;
