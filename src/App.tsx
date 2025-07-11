// Arquivo: src/App.tsx (VERSÃO DE TESTE PARA ENCONTRAR O ERRO)
import React from 'react';

function App() {
  return (
    <div style={{ 
      backgroundColor: '#dcfce7', // Verde claro
      color: '#15803d',           // Verde escuro
      padding: '40px', 
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
        Teste de Renderização Concluído
      </h1>
      <p style={{ fontSize: '20px', marginTop: '16px' }}>
        Se você está vendo esta tela verde, significa que o App.tsx conseguiu ser renderizado com sucesso.
      </p>
      <p style={{ fontSize: '16px', marginTop: '32px', fontStyle: 'italic' }}>
        O problema da "tela branca" está no código que foi removido, muito provavelmente no hook `useCalorieTrackerFirebase` ou na forma como seus dados são usados.
      </p>
    </div>
  );
}

export default App;
