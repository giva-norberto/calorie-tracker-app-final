import React from 'react';
import { Flame, Target, TrendingUp, Activity, Award, Calendar, Zap, Star, Bell, AlertTriangle } from 'lucide-react';
import { DailyData } from '../types';

interface DashboardProps {
  dailyData: DailyData;
  tdee: number;
  currentDate: string;
  alerts?: Array<{
    id: number;
    type: 'goal' | 'warning' | 'achievement' | 'reminder';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyData, tdee, currentDate, alerts = [] }) => {
  const totalConsumed = dailyData.foods.reduce((sum, food) => sum + (food.calories * food.quantity), 0);
  const totalBurned = dailyData.exercises.reduce((sum, exercise) => sum + exercise.calories, 0);
  const netCalories = totalConsumed - totalBurned;
  const remainingCalories = tdee - netCalories;
  const progress = tdee > 0 ? Math.min((totalConsumed / tdee) * 100, 100) : 0;

  // Gerar alertas inteligentes
  const generateSmartAlerts = () => {
    const smartAlerts = [];
    const currentHour = new Date().getHours();
    
    // Alerta de meta diária
    if (progress > 110) {
      smartAlerts.push({
        id: 1,
        type: 'warning' as const,
        title: 'Meta Excedida',
        message: `Você já consumiu ${Math.round(progress)}% da sua meta diária. Considere exercícios extras.`,
        priority: 'high' as const
      });
    } else if (progress < 50 && currentHour > 18) {
      smartAlerts.push({
        id: 2,
        type: 'reminder' as const,
        title: 'Baixo Consumo',
        message: 'Você está consumindo poucas calorias hoje. Certifique-se de se alimentar adequadamente.',
        priority: 'medium' as const
      });
    }

    // Alerta de hidratação
    if (currentHour > 12 && !dailyData.foods.some(food => food.name.toLowerCase().includes('água'))) {
      smartAlerts.push({
        id: 3,
        type: 'reminder' as const,
        title: 'Hidratação',
        message: 'Lembre-se de beber água! Meta: 8 copos por dia.',
        priority: 'low' as const
      });
    }

    // Alerta de conquista
    if (progress >= 95 && progress <= 105) {
      smartAlerts.push({
        id: 4,
        type: 'achievement' as const,
        title: 'Meta Perfeita!',
        message: 'Parabéns! Você atingiu sua meta calórica de forma equilibrada.',
        priority: 'high' as const
      });
    }

    return [...alerts, ...smartAlerts];
  };

  const allAlerts = generateSmartAlerts();

  // Determinar status da meta
  const getGoalStatus = () => {
    const percentage = (totalConsumed / tdee) * 100;
    if (percentage < 80) return { status: 'Abaixo da Meta', color: 'text-blue-600', bgColor: 'from-blue-50 to-blue-100', icon: TrendingUp };
    if (percentage <= 110) return { status: 'Meta Atingida', color: 'text-green-600', bgColor: 'from-green-50 to-green-100', icon: Award };
    return { status: 'Acima da Meta', color: 'text-orange-600', bgColor: 'from-orange-50 to-orange-100', icon: Flame };
  };

  const goalStatus = getGoalStatus();
  const StatusIcon = goalStatus.icon;

  const stats = [
    {
      label: 'Consumidas',
      value: totalConsumed,
      unit: 'kcal',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      bgColor: 'from-red-50 to-orange-50',
      textColor: 'text-red-600'
    },
    {
      label: 'Queimadas',
      value: totalBurned,
      unit: 'kcal',
      icon: Activity,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Meta',
      value: tdee,
      unit: 'kcal',
      icon: Target,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Restantes',
      value: Math.max(remainingCalories, 0),
      unit: 'kcal',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-600'
    }
  ];

  // Formatar data corretamente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Motivação baseada no progresso
  const getMotivationalMessage = () => {
    if (progress < 50) return "Você está começando bem! Continue assim! 💪";
    if (progress < 80) return "Ótimo progresso! Você está no caminho certo! 🌟";
    if (progress <= 100) return "Parabéns! Meta quase alcançada! 🎯";
    return "Meta superada! Você é incrível! 🏆";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'achievement': return Award;
      case 'reminder': return Bell;
      default: return Bell;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="space-y-8 pb-20 pt-4">
        {/* Cabeçalho com Status */}
        <div className="text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Zap className="w-8 h-8 mr-3 text-blue-500" />
            Painel
          </h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">{formatDate(currentDate)}</p>
          
          {/* Status da Meta */}
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${goalStatus.bgColor} border border-opacity-20 shadow-lg`}>
            <StatusIcon className={`w-5 h-5 mr-2 ${goalStatus.color}`} />
            <span className={`font-semibold ${goalStatus.color}`}>{goalStatus.status}</span>
          </div>
          
          {/* Mensagem Motivacional */}
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <p className="text-indigo-700 font-medium">{getMotivationalMessage()}</p>
          </div>
        </div>

        {/* Alertas Inteligentes */}
        {allAlerts.length > 0 && (
          <div className="mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-indigo-500" />
              Alertas Personalizados
            </h3>
            <div className="space-y-3">
              {allAlerts.slice(0, 3).map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${getAlertColor(alert.priority)} flex items-start space-x-3`}
                  >
                    <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-sm opacity-90">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Círculo de Progresso Melhorado */}
        <div className="flex justify-center px-4">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-200"
              />
              {/* Círculo de progresso */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out drop-shadow-lg"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white rounded-full p-6 shadow-lg">
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{Math.round(progress)}%</p>
                <p className="text-sm text-gray-600 font-medium">Meta Diária</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalConsumed} / {tdee} kcal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grade de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgColor} p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-opacity-20`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg mb-3`}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-lg lg:text-2xl font-bold ${stat.textColor}`}>
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{stat.unit}</p>
                </div>
                <div className={`absolute top-0 right-0 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
              </div>
            );
          })}
        </div>

        {/* Resumo Rápido */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            Resumo do Dia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <p className="text-2xl font-bold text-indigo-600">{dailyData.foods.length}</p>
              <p className="text-sm text-gray-600">Refeições</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-2xl font-bold text-green-600">{dailyData.exercises.length}</p>
              <p className="text-sm text-gray-600">Exercícios</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-orange-100">
              <p className="text-2xl font-bold text-orange-600">{netCalories}</p>
              <p className="text-sm text-gray-600">Kcal Líquidas</p>
            </div>
          </div>
        </div>

        {/* Comidas e Exercícios Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
          {/* Comidas Recentes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Flame className="w-5 h-5 mr-2 text-red-500" />
              Últimas Refeições
            </h3>
            {dailyData.foods.length > 0 ? (
              <div className="space-y-3">
                {dailyData.foods.slice(-4).map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:shadow-md transition-all duration-200 border border-red-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{food.name}</p>
                      <p className="text-sm text-gray-600">{food.quantity} {food.unit}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-red-600">{food.calories * food.quantity}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-gray-500">Nenhuma refeição registrada</p>
              </div>
            )}
          </div>

          {/* Exercícios Recentes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Últimos Exercícios
            </h3>
            {dailyData.exercises.length > 0 ? (
              <div className="space-y-3">
                {dailyData.exercises.slice(-4).map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-200 border border-blue-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{exercise.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exercise.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-blue-600">{exercise.calories}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-gray-500">Nenhum exercício registrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Dica do Dia */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 mx-4 border border-emerald-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2 text-emerald-500" />
            💡 Dica do Dia
          </h3>
          <p className="text-gray-700">
            Mantenha-se hidratado! Beba pelo menos 8 copos de água por dia para manter seu metabolismo funcionando bem e ajudar na digestão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;