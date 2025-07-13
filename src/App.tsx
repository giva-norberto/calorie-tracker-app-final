// src/App.tsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

// CORREÇÃO DEFINITIVA: O caminho agora aponta para a pasta 'config'
// onde o seu arquivo firebase.ts realmente está.
import { auth, googleProvider } from './config/firebase.ts';

function App() {
  // Estado para armazenar as informações do usuário logado
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito para verificar o estado de autenticação quando o componente monta
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpa o listener quando o componente desmonta
    return () => unsubscribe();
  }, []);

  // Função para fazer login com o Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // O listener onAuthStateChanged cuidará de atualizar o estado do usuário
    } catch (error) {
      console.error("Erro ao fazer login com o Google:", error);
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O listener onAuthStateChanged cuidará de atualizar o estado do usuário para null
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  // Renderiza um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Meu App de Calorias</h1>
        {user && <p>Bem-vindo, {user.displayName || 'Usuário'}!</p>}
      </header>
      <main className="app-main">
        {user ? (
          // Se o usuário estiver logado, mostra o botão de logout
          <button onClick={handleLogout} className="logout-button">
            Sair (Logout)
          </button>
        ) : (
          // Se não estiver logado, mostra o botão de login
          <button onClick={handleGoogleLogin} className="login-button">
            Entrar com Google
          </button>
        )}
      </main>
    </div>
  );
}

export default App;