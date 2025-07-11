import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        setAuthState({
          user,
          loading: false,
          error: null
        });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error.message
        });
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Iniciando login com Google...');
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log('Login bem-sucedido:', result.user.email);
      return result.user;
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado pelo usuário';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado pelo navegador';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Fazendo logout...');
      await signOut(auth);
      console.log('Logout bem-sucedido');
    } catch (error: any) {
      console.error('Erro no logout:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao fazer logout'
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    logout,
    clearError
  };
};