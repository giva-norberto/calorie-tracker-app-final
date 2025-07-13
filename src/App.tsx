/ src/App.tsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, User, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from './config/firebase.ts';

// CORREÇÃO FINAL: Importando o seu arquivo de estilos principal.
// Esta linha fará com que o seu aplicativo deixe de parecer "desconfigurado".
import './index.css';

// ===================================================================
// Importando o componente 'Home' do seu projeto.
// ===================================================================
import Home from './components/Home'; 


// ===================================================================
// TELA DE LOGIN (Nenhuma alteração necessária aqui)
// ===================================================================
const TelaDeLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error)      {
      console.error("Erro ao iniciar o login com Google:", error);
    }
  };

  return (
    <div className="login-container">
      <h1>Bem-vindo ao App de Calorias</h1>
      <p>Faça login para continuar</p>
      <button onClick={handleGoogleLogin} className="login-button">
        Entrar com Google
      </button>
    </div>
  );
};


// ===================================================================
// COMPONENTE PRINCIPAL QUE CONTROLA TUDO
// ===================================================================
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    getRedirectResult(auth).catch((error) => {
        console.error("Erro no resultado do redirecionamento de login:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  // Agora, se o utilizador estiver logado, o componente 'Home' é renderizado.
  return user ? <Home user={user} handleLogout={handleLogout} /> : <TelaDeLogin />;
}

export default App;

