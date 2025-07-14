import React from 'react';
import { useAuth } from '../hooks/useAuth';

const TelaDeLogin: React.FC = () => {
  const { signInWithGoogle, error, loading, clearError } = useAuth();

  const handleLogin = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // erro tratado no hook
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo ao App de Calorias</h1>
      <p className="mb-6">Faça login para continuar</p>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? 'Entrando...' : 'Entrar com Google'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default TelaDeLogin;

