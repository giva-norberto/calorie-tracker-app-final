import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Scale, Ruler, Activity, Calendar, Award } from 'lucide-react';
import { WeightEntry, WaistEntry, UserInfo } from '../types';

interface EvolutionDashboardProps {
  weightHistory: WeightEntry[];
  waistHistory: WaistEntry[];
  userInfo: UserInfo;
  tdeeHistory: Array<{ date: string; tdee: number }>;
}

const EvolutionDashboard: React.FC<EvolutionDashboardProps> = ({
  weightHistory,
  waistHistory,
  userInfo,
  tdeeHistory
}) => {
  // Calcular estatísticas de evolução
  const evolutionStats = useMemo(() => {
    const sortedWeights = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedWaist = [...waistHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedWeights.length < 2) return null;

    const firstWeight = sortedWeights[0];
    const lastWeight = sortedWeights[sortedWeights.length - 1];
    const weightChange = lastWeight.weight - firstWeight.weight;
    
    let waistChange = 0;
    if (sortedWaist.length >= 2) {
      const firstWaist = sortedWaist[0];
      const lastWaist = sortedWaist[sortedWaist.length - 1];
      waistChange = lastWaist.waist - firstWaist.waist;
    }

    // Calcular tendência dos últimos 7 dias
    const last7Days = sortedWeights.slice(-7);
    let weeklyTrend = 0;
    if (last7Days.length >= 2) {
      weeklyTrend = last7Days[last7Days.length - 1].weight - last7Days[0].weight;
    }

    return {
      totalWeightChange: weightChange,
      totalWaistChange: waistChange,
      weeklyTrend,
      daysTracked: sortedWeights.length,
      startDate: firstWeight.date,
      currentWeight: lastWeight.weight,
      goalWeight: parseFloat(userInfo.goalWeight || '0'),
      remainingToGoal: parseFloat(userInfo.goalWeight || '0') - lastWeight.weight
    };
  }, [weightHistory, waistHistory, userInfo]);

  // Gráfico de evolução do peso
  const WeightEvolutionChart = () => {
    const sortedWeights = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedWeights.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500">
          <p>Dados insuficientes para gráfico</p>
        </div>
      );
    }

    const weights = sortedWeights.map(entry => entry.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const range = maxWeight - minWeight || 1;
    const padding = range * 0.1;

    return (
      <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 relative">
        <div className="flex items-end justify-between h-full space-x-1">
          {sortedWeights.slice(-12).map((entry, index, array) => {
            const height = ((entry.weight - (minWeight - padding)) / (range + 2 * padding)) * 100;
            const isLatest = index === array.length - 1;
            const isGoal = userInfo.goalWeight && Math.abs(entry.weight - parseFloat(userInfo.goalWeight)) < 0.5;
            
            return (
              <div key={entry.id} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-700 mb-1 font-medium bg-white/80 px-1 py-0.5 rounded text-center">
                  {entry.weight}kg
                </div>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isGoal 
                      ? 'bg-gradient-to-t from-green-500 to-emerald-500' 
                      : isLatest 
                        ? 'bg-gradient-to-t from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-t from-gray-400 to-gray-500'
                  }`}
                  style={{ 
                    height: `${Math.max(height, 15)}%`,
                    minHeight: '20px'
                  }}
                />
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Linha da meta */}
        {userInfo.goalWeight && (
          <div 
            className="absolute left-4 right-4 border-t-2 border-dashed border-green-500 opacity-70"
            style={{ 
              top: `${100 - ((parseFloat(userInfo.goalWeight) - (minWeight - padding)) / (range + 2 * padding)) * 100}%` 
            }}
          >
            <span className="absolute -top-6 right-0 text-xs text-green-600 font-semibold bg-white px-2 py-1 rounded">
              Meta: {userInfo.goalWeight}kg
            </span>
          </div>
        )}
      </div>
    );
  };

  // Gráfico de cintura
  const WaistEvolutionChart = () => {
    const sortedWaist = [...waistHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedWaist.length < 2) {
      return (
        <div className="h-32 flex items-center justify-center text-gray-500">
          <p>Sem dados de cintura</p>
        </div>
      );
    }

    const waists = sortedWaist.map(entry => entry.waist);
    const maxWaist = Math.max(...waists);
    const minWaist = Math.min(...waists);
    const range = maxWaist - minWaist || 1;
    const padding = range * 0.1;

    return (
      <div className="h-32 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 relative">
        <div className="flex items-end justify-between h-full space-x-1">
          {sortedWaist.slice(-8).map((entry, index, array) => {
            const height = ((entry.waist - (minWaist - padding)) / (range + 2 * padding)) * 100;
            const isLatest = index === array.length - 1;
            
            return (
              <div key={entry.id} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-700 mb-1 font-medium bg-white/80 px-1 py-0.5 rounded text-center">
                  {entry.waist}cm
                </div>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isLatest 
                      ? 'bg-gradient-to-t from-orange-500 to-yellow-500' 
                      : 'bg-gradient-to-t from-gray-400 to-gray-500'
                  }`}
                  style={{ 
                    height: `${Math.max(height, 15)}%`,
                    minHeight: '15px'
                  }}
                />
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!evolutionStats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Dados Insuficientes</h3>
        <p className="text-gray-600">
          Registre pelo menos 2 medições de peso para ver sua evolução.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <TrendingUp className="w-7 h-7 mr-2 text-blue-500" />
          Dashboard de Evolução
        </h2>
        <p className="text-gray-600">Acompanhe seu progresso ao longo do tempo</p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Scale className="w-5 h-5 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">Peso Atual</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{evolutionStats.currentWeight}kg</p>
        </div>

        <div className={`rounded-xl p-4 text-center border ${
          evolutionStats.totalWeightChange < 0 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
        }`}>
          <div className="flex items-center justify-center mb-2">
            {evolutionStats.totalWeightChange < 0 ? (
              <TrendingDown className="w-5 h-5 text-green-600 mr-1" />
            ) : (
              <TrendingUp className="w-5 h-5 text-orange-600 mr-1" />
            )}
            <span className="text-sm font-medium text-gray-700">Mudança Total</span>
          </div>
          <p className={`text-2xl font-bold ${
            evolutionStats.totalWeightChange < 0 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {evolutionStats.totalWeightChange > 0 ? '+' : ''}{evolutionStats.totalWeightChange.toFixed(1)}kg
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-purple-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">Para a Meta</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {Math.abs(evolutionStats.remainingToGoal).toFixed(1)}kg
          </p>
          <p className="text-xs text-gray-500">
            {evolutionStats.remainingToGoal > 0 ? 'faltam' : 'excesso'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-200">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-emerald-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">Dias Rastreados</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{evolutionStats.daysTracked}</p>
        </div>
      </div>

      {/* Gráfico de Evolução do Peso */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          Evolução do Peso
        </h3>
        <WeightEvolutionChart />
      </div>

      {/* Gráfico de Cintura (se disponível) */}
      {waistHistory.length > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Ruler className="w-5 h-5 mr-2 text-orange-500" />
            Evolução da Cintura
          </h3>
          <WaistEvolutionChart />
          
          {evolutionStats.totalWaistChange !== 0 && (
            <div className="mt-4 text-center">
              <p className={`text-lg font-semibold ${
                evolutionStats.totalWaistChange < 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {evolutionStats.totalWaistChange > 0 ? '+' : ''}{evolutionStats.totalWaistChange.toFixed(1)}cm
              </p>
              <p className="text-sm text-gray-600">Mudança total na cintura</p>
            </div>
          )}
        </div>
      )}

      {/* Tendência Semanal */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-indigo-500" />
          Tendência Semanal
        </h3>
        
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center px-4 py-2 rounded-full ${
            evolutionStats.weeklyTrend < 0 
              ? 'bg-green-100 text-green-800' 
              : evolutionStats.weeklyTrend > 0 
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {evolutionStats.weeklyTrend < 0 ? (
              <TrendingDown className="w-4 h-4 mr-2" />
            ) : evolutionStats.weeklyTrend > 0 ? (
              <TrendingUp className="w-4 h-4 mr-2" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            <span className="font-semibold">
              {evolutionStats.weeklyTrend === 0 
                ? 'Estável' 
                : `${evolutionStats.weeklyTrend > 0 ? '+' : ''}${evolutionStats.weeklyTrend.toFixed(1)}kg`
              }
            </span>
          </div>
          <p className="text-sm text-gray-600">nos últimos 7 dias</p>
        </div>
      </div>

      {/* Conquistas */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-600" />
          🏆 Conquistas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evolutionStats.daysTracked >= 7 && (
            <div className="flex items-center p-3 bg-white rounded-lg border border-yellow-200">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">7</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Consistência</p>
                <p className="text-sm text-gray-600">7+ dias de rastreamento</p>
              </div>
            </div>
          )}
          
          {Math.abs(evolutionStats.totalWeightChange) >= 1 && (
            <div className="flex items-center p-3 bg-white rounded-lg border border-yellow-200">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Progresso Visível</p>
                <p className="text-sm text-gray-600">Mudança de 1kg+</p>
              </div>
            </div>
          )}
          
          {evolutionStats.remainingToGoal <= 0 && userInfo.goalWeight && (
            <div className="flex items-center p-3 bg-white rounded-lg border border-yellow-200">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Meta Alcançada!</p>
                <p className="text-sm text-gray-600">Parabéns pelo objetivo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvolutionDashboard;