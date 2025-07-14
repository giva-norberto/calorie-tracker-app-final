import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Olá, {user?.displayName || 'Usuário'}</h1>
      <p>Email: {user?.email}</p>
      {user?.photoURL && (
        <img
          src={user.photoURL}
          alt="Avatar"
          className="w-24 h-24 rounded-full mt-4 mb-6"
        />
      )}
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Sair
      </button>
    </div>
  );
};

export default Home;

