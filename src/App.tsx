import React from 'react';
import useCalorieTrackerFirebase from './hooks/useCalorieTrackerFirebase';

function App() {
  const { loading, error, data } = useCalorieTrackerFirebase();

  // Guarda de Segurança 1: Mostra "Carregando..."
  if (loading) {
    return (
      <div style={{ padding: '40px', fontSize: '24px', textAlign: 'center' }}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  // Guarda de Segurança 2: Mostra o erro, se houver
  if (error) {
    return (
      <div style={{ padding: '40px', fontSize: '24px', textAlign: 'center', color: 'red' }}>
        <h1>Erro!</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Guarda de Segurança 3: Garante que os dados existem
  if (!data) {
    return (
      <div style={{ padding: '40px', fontSize: '24px', textAlign: 'center', color: 'orange' }}>
        <h1>Nenhum dado retornado do hook.</h1>
      </div>
    );
  }

  // Se tudo deu certo, mostra a tela de sucesso
  return (
    <div style={{ padding: '40px', fontSize: '24px', textAlign: 'center', backgroundColor: 'lightgreen' }}>
      <h1>Teste Concluído com Sucesso!</h1>
      <p>O hook e o App conseguiram renderizar.</p>
      <p>O erro está na lógica REAL do seu hook ou em um dos componentes que ele alimenta.</p>
    </div>
  );
}

export default App;
