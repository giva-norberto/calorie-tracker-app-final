import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const TelaDeLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/'); // Redireciona para a home após login
    } catch (error) {
      console.error('Erro ao fazer login com o Google:', error);
      alert('Falha no login. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo ao App de Calorias</h1>
      <p className="mb-6">Faça login para continuar</p>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
      >
        Entrar com Google
      </button>
    </div>
  );
};

export default TelaDeLogin;
