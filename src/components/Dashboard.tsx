import React from 'react';
import { DailyData, Alert } from '../types'; // Importe seus tipos
import { Zap, TriangleAlert } from 'lucide-react'; // Importe ícones se usar

// Tipos para as props do Dashboard
interface DashboardProps {
  dailyData: DailyData | null | undefined;
  tdee: number;
  currentDate: string;
  alerts: Alert[];
}

// Componente Dashboard Corrigido e Defensivo
const Dashboard: React.FC<DashboardProps> = ({ dailyData, tdee, currentDate, alerts }) => {
  // VERIFICAÇÃO DE SEGURANÇA 1: Se `dailyData` ainda não chegou, mostre um loading.
  // Isso previne erros de tentar ler `dailyData.foods` quando `dailyData` é nulo.
  if (!dailyData) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 text-center">
        Carregando dados do dia...
      </div>
    );
  }

  // A partir daqui, temos certeza que `dailyData` existe.
  // Usamos 'optional chaining' (?.) e 'nullish coalescing' (??) para segurança extra.
  const consumedCalories = dailyData.foods?.reduce((acc, food) => acc + (food.calories * food.quantity), 0) ?? 0;
  const burnedCalories = dailyData.exercises?.reduce((acc, exercise) => acc + exercise.caloriesBurned, 0) ?? 0;
  const netCalories = consumedCalories - burnedCalories;
  const remainingCalories = tdee - netCalories;

  const activeAlerts = alerts?.filter(alert => !alert.read) ?? [];

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Painel Principal</h1>
        <p className="text-gray-600">Resumo do seu dia: {new Date(currentDate + 'T00:00:00').toLocaleDateString()}</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h3 className="font-semibold text-lg text-gray-700">Calorias Restantes</h3>
          <p className="text-4xl font-bold text-green-600">{Math.round(remainingCalories)}</p>
          <p className="text-sm text-gray-500">de {tdee} kcal</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h3 className="font-semibold text-lg text-gray-700">Consumidas</h3>
          <p className="text-4xl font-bold text-blue-600">{Math.round(consumedCalories)}</p>
          <p className="text-sm text-gray-500">kcal</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h3 className="font-semibold text-lg text-gray-700">Queimadas</h3>
          <p className="text-4xl font-bold text-orange-600">{Math.round(burnedCalories)}</p>
          <p className="text-sm text-gray-500">kcal</p>
        </div>
      </div>

      {/* Alertas */}
      {activeAlerts.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <TriangleAlert className="w-6 h-6 mr-3" />
            <div>
              <h4 className="font-bold">Alertas Pendentes</h4>
              {activeAlerts.map(alert => (
                <p key={alert.id} className="text-sm">{alert.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Listas de Comidas e Exercícios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-semibold text-xl mb-4">Comidas Registradas</h3>
          <ul className="space-y-2">
            {dailyData.foods?.length > 0 ? (
              dailyData.foods.map(food => (
                <li key={food.id} className="flex justify-between items-center border-b pb-2">
                  <span>{food.name} ({food.quantity} {food.unit})</span>
                  <span className="font-semibold">{Math.round(food.calories * food.quantity)} kcal</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 italic">Nenhuma comida registrada hoje.</p>
            )}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-semibold text-xl mb-4">Exercícios Registrados</h3>
          <ul className="space-y-2">
            {dailyData.exercises?.length > 0 ? (
              dailyData.exercises.map(exercise => (
                <li key={exercise.id} className="flex justify-between items-center border-b pb-2">
                  <span>{exercise.name} ({exercise.duration} min)</span>
                  <span className="font-semibold">{Math.round(exercise.caloriesBurned)} kcal</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 italic">Nenhum exercício registrado hoje.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
