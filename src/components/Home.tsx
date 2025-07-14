import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const Home: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-bold mb-4">Olá, {user.displayName} 👋</h1>

      {user.photoURL && (
        <img
          src={user.photoURL}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full mb-4 shadow-md"
        />
      )}

      <p className="text-lg text-gray-700">
        <strong>Email:</strong> {user.email}
      </p>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition"
      >
        Sair
      </button>
    </div>
  );
};

export default Home;
