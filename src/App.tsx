import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- ATENÇÃO: VERIFIQUE ESTE CAMINHO ---
// O erro acontece aqui. Verifique a sua estrutura de pastas no seu computador.
// Apenas UMA das linhas de 'import' abaixo deve estar ativa. As outras devem ser apagadas ou comentadas (com // no início).

// Opção 1: Se 'App.tsx' e o seu ficheiro de configuração do Firebase estão na mesma pasta (ex: ambos dentro de 'src'), use esta linha:
import { auth } from './firebase';

// Opção 2: Se 'App.tsx' está numa subpasta (ex: 'src/components') e o seu ficheiro do Firebase está em 'src', use esta linha:
// import { auth } from '../firebase';

// Opção 3: Se o seu ficheiro de configuração está numa pasta 'config' (ex: 'src/config/firebase.ts'), use esta linha:
// import { auth } from './config/firebase';


// --- Componentes de Exemplo (Substitua pelos seus componentes reais) ---
// O código abaixo é apenas um exemplo para a lógica funcionar.
// Você deve usar os seus próprios componentes de Login e Dashboard.

const LoginPage = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>CalorieTracker</h1>
    <p>Faça login para continuar</p>
    {/* O seu botão de login real estaria aqui */}
    <button>Entrar com Google</button>
  </div>
);

const Dashboard = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>Bem-vindo!</h1>
    <p>Este é o seu painel de calorias.</p>
  </div>
);

// --- Componente Principal da Aplicação ---

function App() {
  // Estado para controlar se a verificação inicial de autenticação está a decorrer
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para guardar a informação do utilizador logado
  const [user, setUser] = useState<User | null>(null);

  // useEffect é usado para executar código uma vez, quando o componente é montado.
  useEffect(() => {
    // onAuthStateChanged é um "ouvinte" do Firebase. Ele avisa-nos
    // sempre que o estado de login muda.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Atualiza o nosso estado com o utilizador atual (pode ser null)
      setUser(currentUser);
      
      // AQUI ESTÁ A CORREÇÃO CRUCIAL:
      // Independentemente de haver um utilizador ou não, a verificação terminou.
      // Portanto, definimos o carregamento como 'false'.
      setIsLoading(false);
    });

    // Esta função de limpeza é importante para evitar problemas de performance.
    return () => unsubscribe();
  }, []); // O array vazio [] garante que este código só roda uma vez.

  // Enquanto a verificação inicial está a decorrer, mostramos a mensagem de "Carregando...".
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Carregando...
      </div>
    );
  }

  // Quando isLoading for 'false', o React vai renderizar uma das duas opções abaixo:
  return (
    <div>
      {/* Se existe um 'user', mostra o Dashboard. Senão, mostra a LoginPage. */}
      {user ? <Dashboard /> : <LoginPage />}
    </div>
  );
}

export default App;
