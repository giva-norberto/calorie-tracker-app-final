import React from 'react';
import { Calendar, Flame, Activity, TrendingUp, Trash2 } from 'lucide-react';
import { DailyData } from '../types';

interface HistoryProps {
  viewedDate: string;
  setViewedDate: (date: string) => void;
  getDailyData: (date: string) => DailyData;
  removeFood: (date: string, foodId: number) => void;
  removeExercise: (date: string, exerciseId: number) => void;
  tdee: number;
}

const History: React.FC<HistoryProps> = ({
  viewedDate,
  setViewedDate,
  getDailyData,
  removeFood,
  removeExercise,
  tdee
}) => {
  const dailyData = getDailyData(viewedDate);
  const totalConsumed = dailyData.foods.reduce((sum, food) => sum + (food.calories * food.quantity), 0);
  const totalBurned = dailyData.exercises.reduce((sum, exercise) => sum + exercise.calories, 0);
  const netCalories = totalConsumed - totalBurned;
  const remainingCalories = Math.max(tdee - netCalories, 0);

  const stats = [
    {
      label: 'Consumidas',
      value: totalConsumed,
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      bgColor: 'from-red-50 to-orange-50',
      textColor: 'text-red-600'
    },
    {
      label: 'Queimadas',
      value: totalBurned,
      icon: Activity,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Líquidas',
      value: netCalories,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Restantes',
      value: remainingCalories,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-600'
    }
  ];

  // Função para formatar data corretamente
  const formatDisplayDate = (dateString: string) => {
    try {
      // Criar data sem problemas de timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  // Função para formatar horário corretamente
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Erro ao formatar horário:', error);
      return '--:--';
    }
  };

  // Função para formatar data curta
  const formatShortDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Erro ao formatar data curta:', error);
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico</h2>
        <p className="text-gray-600">Visualize seus dados de rastreamento passados</p>
      </div>

      {/* Seletor de Data */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Selecionar Data
        </label>
        <input
          type="date"
          value={viewedDate}
          onChange={(e) => setViewedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        />
        <p className="text-sm text-gray-500 mt-2">
          Visualizando dados de: <span className="font-semibold text-gray-700">{formatDisplayDate(viewedDate)}</span>
        </p>
      </div>

      {/* Estatísticas para a Data Selecionada */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgColor} p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.textColor}`}>
                {stat.value}
                <span className="text-xs ml-1">kcal</span>
              </p>
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
            </div>
          );
        })}
      </div>

      {/* Comidas para a Data Selecionada */}
      {dailyData.foods.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-red-500" />
            Comidas - {formatShortDate(viewedDate)}
          </h3>
          <div className="space-y-3">
            {dailyData.foods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{food.name}</h4>
                  <p className="text-sm text-gray-600">{food.quantity} {food.unit}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatTime(food.timestamp)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{food.calories * food.quantity} kcal</p>
                    <p className="text-xs text-gray-500">{food.calories} por {food.unit}</p>
                  </div>
                  <button
                    onClick={() => removeFood(viewedDate, food.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercícios para a Data Selecionada */}
      {dailyData.exercises.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Exercícios - {formatShortDate(viewedDate)}
          </h3>
          <div className="space-y-3">
            {dailyData.exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatTime(exercise.timestamp)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{exercise.calories} kcal</p>
                  </div>
                  <button
                    onClick={() => removeExercise(viewedDate, exercise.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {dailyData.foods.length === 0 && dailyData.exercises.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sem Dados</h3>
          <p className="text-gray-600">
            Nenhuma comida ou exercício registrado para {formatDisplayDate(viewedDate)}.
          </p>
        </div>
      )}
    </div>
  );
};

export default History;