// src/App.tsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, User, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from './config/firebase.ts';

// ===================================================================
// PASSO 1: IMPORTE O SEU COMPONENTE PRINCIPAL AQUI
// ===================================================================
// Altere o nome 'SeuComponentePrincipal' e o caminho './pages/SeuComponentePrincipal'
// para corresponder ao seu arquivo principal.
import SeuComponentePrincipal from './pages/SeuComponentePrincipal'; 


// ===================================================================
// TELA DE LOGIN (Nenhuma alteração necessária aqui)
// ===================================================================
const TelaDeLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
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

  // Se o utilizador estiver logado, mostra o seu aplicativo principal.
  // Se não, mostra a tela de login.
  // O 'handleLogout' é passado para que o seu componente principal possa ter um botão de sair.
  return user ? <SeuComponentePrincipal user={user} handleLogout={handleLogout} /> : <TelaDeLogin />;
}

export default App;

