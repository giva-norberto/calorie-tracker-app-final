// src/App.tsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config/firebase.ts';

// Importando o seu CSS principal para garantir que os estilos sejam aplicados
import './index.css';

// ===================================================================
// CORREÇÃO: Adicionando a extensão .tsx aos imports.
// O processo de build do Vite precisa disso para encontrar os arquivos.
// ===================================================================
import Home from './components/Home.tsx';
import TelaDeLogin from './components/TelaDeLogin.tsx';

// ===================================================================
// COMPONENTE DE ROTA PROTEGIDA
// Este componente verifica se o utilizador está logado.
// ===================================================================
const RotaProtegida = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};


// ===================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO (App)
// Configura as rotas da aplicação.
// ===================================================================
function App() {
  return (
    <BrowserRouter basename="/calorie-tracker-app-final/">
      <Routes>
        {/* Rota para a página de login */}
        <Route path="/login" element={<TelaDeLogin />} />

        {/* Rota principal e protegida para o seu aplicativo */}
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />
        
        {/* Qualquer outra rota redireciona para a principal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

import TelaDeLogin from './components/TelaDeLogin';



