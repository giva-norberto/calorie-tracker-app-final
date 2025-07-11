import React from 'react';
import { LogIn, Loader2, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, error, signInWithGoogle, clearError } = useAuth();

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando...</h2>
          <p className="text-gray-600">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  // Tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">CalorieTracker</h1>
            <p className="text-gray-600">Faça login para acessar seu rastreador de calorias</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm font-medium">Erro no login</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 text-sm underline mt-2 hover:text-red-800"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Entrar com Google
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Seus dados serão sincronizados com segurança na nuvem
            </p>
          </div>

          {/* Informações de configuração para desenvolvimento */}
          {(import.meta.env.DEV || !import.meta.env.VITE_FIREBASE_API_KEY) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-xs font-medium mb-2">
                ⚠️ {import.meta.env.DEV ? 'Modo Desenvolvimento' : 'Configuração Necessária'}
              </p>
              <p className="text-yellow-700 text-xs">
                {import.meta.env.DEV 
                  ? 'Configure as variáveis de ambiente do Firebase no arquivo .env para usar em produção.'
                  : 'As variáveis de ambiente do Firebase não estão configuradas. Configure-as no painel do Netlify.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // App autenticado
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

export default AuthWrapper;