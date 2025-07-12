import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase'; // Verifique se o caminho está correto

// Supondo que estes são os seus componentes
import LoginPage from './components/LoginPage'; 
import Dashboard from './components/Dashboard'; 

function App() {
  // Este estado controla se a verificação inicial está a acontecer
  const [isLoading, setIsLoading] = useState(true); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    // onAuthStateChanged fica a "ouvir" se o estado de login muda
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // AQUI ESTÁ A CORREÇÃO CRUCIAL:
      // Desliga o "Carregando..." independentemente de haver um utilizador ou não.
      setIsLoading(false); 
    });

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => unsubscribe();
  }, []); // O array vazio [] garante que isto só roda uma vez

  // Enquanto está a verificar, mostra a mensagem de "Carregando..."
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Depois de verificar, mostra a página certa
  return (
    <div>
      {user ? <Dashboard /> : <LoginPage />}
    </div>
  );
}

export default App;