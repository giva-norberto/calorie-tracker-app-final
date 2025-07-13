// src/App.tsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, User, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from './config/firebase.ts';

// ===================================================================
// CORREÇÃO: Importando o componente 'Home' do seu projeto.
// ===================================================================
// Se o seu componente principal tiver outro nome ou estiver noutra pasta,
// basta ajustar o nome e o caminho aqui.
import Dashboard from './components/Dashboard'; 


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

  // CORREÇÃO: Agora, se o utilizador estiver logado, o componente 'Home' é renderizado.
  return user ? <Dashboard user={user} handleLogout={handleLogout} /> : <TelaDeLogin />;
}

export default App;
