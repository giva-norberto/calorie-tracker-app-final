import { useState, useEffect } from 'react';

// Um hook de teste super simplificado
export default function useCalorieTrackerFirebase() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    // Simula uma chamada de API que demora 2 segundos
    const timer = setTimeout(() => {
      // Depois de 2 segundos, ele "carrega" dados falsos com sucesso
      setData({
        userInfo: {
          name: 'Usuário de Teste'
        }
      });
      setLoading(false);
    }, 2000);

    // Limpa o timer se o componente for desmontado
    return () => clearTimeout(timer);
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  return { loading, error, data, getDailyData: () => ({}) }; // Retorna o mínimo necessário
}
