import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config/firebase.ts';

// Importa os estilos principais
import './index.css';

// Importa os componentes principais da aplicação
import Home from './components/Home.tsx';
import TelaDeLogin from './components/TelaDeLogin.tsx';

// ===================================================================
// COMPONENTE DE ROTA PROTEGIDA
// Verifica se o usuário está autenticado
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
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Carregando...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// ===================================================================
// COMPONENTE PRINCIPAL DO APP
// Configura as rotas e navegação
// ===================================================================
function App() {
  return (
    <BrowserRouter basename="/calorie-tracker-app-final/">
      <Routes>
        {/* Tela de login */}
        <Route path="/login" element={<TelaDeLogin />} />

        {/* Rota principal protegida */}
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />

        {/* Redirecionamento padrão para rota principal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;




