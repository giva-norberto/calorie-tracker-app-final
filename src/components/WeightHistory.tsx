import React, { useState } from 'react';
import { Scale, TrendingUp, TrendingDown, Calendar, Plus, Trash2, Target, Award, Ruler } from 'lucide-react';
import { WeightEntry, WaistEntry } from '../types';

interface WeightHistoryProps {
  weightHistory: WeightEntry[];
  addWeightEntry: (weight: number) => void;
  removeWeightEntry: (id: number) => void;
  currentWeight: string;
  waistHistory?: WaistEntry[];
  addWaistEntry?: (waist: number) => void;
  removeWaistEntry?: (id: number) => void;
}

const WeightHistory: React.FC<WeightHistoryProps> = ({
  weightHistory = [],
  addWeightEntry,
  removeWeightEntry,
  currentWeight,
  waistHistory = [],
  addWaistEntry,
  removeWaistEntry
}) => {
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [activeTab, setActiveTab] = useState<'weight' | 'waist'>('weight');

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight || isNaN(parseFloat(newWeight)) || parseFloat(newWeight) <= 0) {
      alert('Por favor, digite um peso válido');
      return;
    }

    try {
      addWeightEntry(parseFloat(newWeight));
      setNewWeight('');
    } catch (error) {
      console.error('Erro ao adicionar peso:', error);
      alert('Erro ao adicionar peso. Tente novamente.');
    }
  };

  const handleAddWaist = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWaist || isNaN(parseFloat(newWaist)) || parseFloat(newWaist) <= 0) {
      alert('Por favor, digite uma medida válida');
      return;
    }

    if (!addWaistEntry) {
      alert('Funcionalidade não disponível');
      return;
    }

    try {
      addWaistEntry(parseFloat(newWaist));
      setNewWaist('');
    } catch (error) {
      console.error('Erro ao adicionar cintura:', error);
      alert('Erro ao adicionar medida. Tente novamente.');
    }
  };

  // Proteção extra contra dados inválidos
  const safeWeightHistory = React.useMemo(() => {
    try {
      if (!Array.isArray(weightHistory)) {
        console.warn('weightHistory não é um array:', weightHistory);
        return [];
      }
      return weightHistory.filter(entry => 
        entry && 
        typeof entry.weight === 'number' && 
        entry.date && 
        entry.id
      );
    } catch (error) {
      console.error('Erro ao processar histórico de peso:', error);
      return [];
    }
  }, [weightHistory]);

  const safeWaistHistory = React.useMemo(() => {
    try {
      if (!Array.isArray(waistHistory)) {
        return [];
      }
      return waistHistory.filter(entry => 
        entry && 
        typeof entry.waist === 'number' && 
        entry.date && 
        entry.id
      );
    } catch (error) {
      console.error('Erro ao processar histórico de cintura:', error);
      return [];
    }
  }, [waistHistory]);
  
  const sortedWeightHistory = React.useMemo(() => {
    try {
      return [...safeWeightHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Erro ao ordenar histórico de peso:', error);
      return [];
    }
  }, [safeWeightHistory]);

  const sortedWaistHistory = React.useMemo(() => {
    try {
      return [...safeWaistHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Erro ao ordenar histórico de cintura:', error);
      return [];
    }
  }, [safeWaistHistory]);

  const getWeightTrend = () => {
    try {
      if (sortedWeightHistory.length < 2) return null;
      
      const latest = sortedWeightHistory[sortedWeightHistory.length - 1];
      const previous = sortedWeightHistory[sortedWeightHistory.length - 2];
      
      if (!latest || !previous || typeof latest.weight !== 'number' || typeof previous.weight !== 'number') {
        return null;
      }
      
      const difference = latest.weight - previous.weight;
      
      return {
        difference: Math.abs(difference),
        trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable'
      };
    } catch (error) {
      console.error('Erro ao calcular tendência:', error);
      return null;
    }
  };

  const getWaistTrend = () => {
    try {
      if (sortedWaistHistory.length < 2) return null;
      
      const latest = sortedWaistHistory[sortedWaistHistory.length - 1];
      const previous = sortedWaistHistory[sortedWaistHistory.length - 2];
      
      if (!latest || !previous || typeof latest.waist !== 'number' || typeof previous.waist !== 'number') {
        return null;
      }
      
      const difference = latest.waist - previous.waist;
      
      return {
        difference: Math.abs(difference),
        trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable'
      };
    } catch (error) {
      console.error('Erro ao calcular tendência da cintura:', error);
      return null;
    }
  };

  const weightTrend = getWeightTrend();
  const waistTrend = getWaistTrend();

  // Calcular estatísticas com proteção
  const getWeightStats = () => {
    try {
      if (sortedWeightHistory.length === 0) return null;
      
      const weights = sortedWeightHistory
        .map(entry => entry.weight)
        .filter(weight => typeof weight === 'number' && !isNaN(weight));
      
      if (weights.length === 0) return null;
      
      const maxWeight = Math.max(...weights);
      const minWeight = Math.min(...weights);
      const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
      
      return {
        max: maxWeight,
        min: minWeight,
        avg: Math.round(avgWeight * 10) / 10,
        range: maxWeight - minWeight
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  };

  const getWaistStats = () => {
    try {
      if (sortedWaistHistory.length === 0) return null;
      
      const waists = sortedWaistHistory
        .map(entry => entry.waist)
        .filter(waist => typeof waist === 'number' && !isNaN(waist));
      
      if (waists.length === 0) return null;
      
      const maxWaist = Math.max(...waists);
      const minWaist = Math.min(...waists);
      const avgWaist = waists.reduce((sum, waist) => sum + waist, 0) / waists.length;
      
      return {
        max: maxWaist,
        min: minWaist,
        avg: Math.round(avgWaist * 10) / 10,
        range: maxWaist - minWaist
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas da cintura:', error);
      return null;
    }
  };

  const weightStats = getWeightStats();
  const waistStats = getWaistStats();

  // Gráfico simplificado e seguro
  const WeightChart = () => {
    try {
      if (sortedWeightHistory.length < 2) return null;

      const weights = sortedWeightHistory.map(entry => entry.weight).filter(w => typeof w === 'number');
      if (weights.length < 2) return null;

      const maxWeight = Math.max(...weights);
      const minWeight = Math.min(...weights);
      const weightRange = maxWeight - minWeight || 1;
      const padding = weightRange * 0.1;

      return (
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-end justify-between h-full space-x-1">
            {sortedWeightHistory.slice(-8).map((entry, index, array) => {
              if (!entry || typeof entry.weight !== 'number') return null;
              
              const height = ((entry.weight - (minWeight - padding)) / (weightRange + 2 * padding)) * 100;
              const isLatest = index === array.length - 1;
              
              return (
                <div key={entry.id || index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-700 mb-1 font-medium bg-white/80 px-1 py-0.5 rounded text-center">
                    {entry.weight}kg
                  </div>
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isLatest 
                        ? 'bg-gradient-to-t from-emerald-500 to-blue-500' 
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
          
          {/* Linha de média */}
          {weightStats && (
            <div 
              className="absolute left-4 right-4 border-t border-dashed border-emerald-500 opacity-50"
              style={{ 
                top: `${100 - ((weightStats.avg - (minWeight - padding)) / (weightRange + 2 * padding)) * 100}%` 
              }}
            />
          )}
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar gráfico:', error);
      return (
        <div className="w-full h-48 bg-gray-100 rounded-xl p-4 flex items-center justify-center">
          <p className="text-gray-500">Erro ao carregar gráfico</p>
        </div>
      );
    }
  };

  const WaistChart = () => {
    try {
      if (sortedWaistHistory.length < 2) return null;

      const waists = sortedWaistHistory.map(entry => entry.waist).filter(w => typeof w === 'number');
      if (waists.length < 2) return null;

      const maxWaist = Math.max(...waists);
      const minWaist = Math.min(...waists);
      const waistRange = maxWaist - minWaist || 1;
      const padding = waistRange * 0.1;

      return (
        <div className="w-full h-48 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-end justify-between h-full space-x-1">
            {sortedWaistHistory.slice(-8).map((entry, index, array) => {
              if (!entry || typeof entry.waist !== 'number') return null;
              
              const height = ((entry.waist - (minWaist - padding)) / (waistRange + 2 * padding)) * 100;
              const isLatest = index === array.length - 1;
              
              return (
                <div key={entry.id || index} className="flex flex-col items-center flex-1">
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
          
          {/* Linha de média */}
          {waistStats && (
            <div 
              className="absolute left-4 right-4 border-t border-dashed border-orange-500 opacity-50"
              style={{ 
                top: `${100 - ((waistStats.avg - (minWaist - padding)) / (waistRange + 2 * padding)) * 100}%` 
              }}
            />
          )}
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar gráfico da cintura:', error);
      return (
        <div className="w-full h-48 bg-gray-100 rounded-xl p-4 flex items-center justify-center">
          <p className="text-gray-500">Erro ao carregar gráfico</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Medidas</h2>
        <p className="text-gray-600">Acompanhe sua evolução de peso e medidas corporais</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mx-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
              activeTab === 'weight'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scale className="w-4 h-4 mr-2" />
            Peso
          </button>
          <button
            onClick={() => setActiveTab('waist')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
              activeTab === 'waist'
                ? 'bg-white text-orange-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Ruler className="w-4 h-4 mr-2" />
            Cintura
          </button>
        </div>
      </div>

      {/* Conteúdo baseado na tab ativa */}
      {activeTab === 'weight' ? (
        <>
          {/* Adicionar Novo Peso */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-blue-500" />
              Registrar Peso Atual
            </h3>
            
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Digite seu peso atual"
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar Peso
              </button>
            </form>
          </div>

          {/* Tendência do Peso */}
          {weightTrend && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tendência do Peso</h3>
                  <p className="text-sm text-gray-600">Comparado ao último registro</p>
                </div>
                <div className="flex items-center space-x-2">
                  {weightTrend.trend === 'up' && (
                    <>
                      <TrendingUp className="w-6 h-6 text-red-500" />
                      <span className="text-red-600 font-semibold">+{weightTrend.difference.toFixed(1)} kg</span>
                    </>
                  )}
                  {weightTrend.trend === 'down' && (
                    <>
                      <TrendingDown className="w-6 h-6 text-green-500" />
                      <span className="text-green-600 font-semibold">-{weightTrend.difference.toFixed(1)} kg</span>
                    </>
                  )}
                  {weightTrend.trend === 'stable' && (
                    <span className="text-gray-600 font-semibold">Estável</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gráfico do Peso */}
          {sortedWeightHistory.length > 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Evolução do Peso</h3>
              <WeightChart />
            </div>
          )}

          {/* Estatísticas do Peso */}
          {weightStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mx-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {sortedWeightHistory[sortedWeightHistory.length - 1]?.weight || 0}kg
                </p>
                <p className="text-sm text-gray-600">Peso Atual</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {weightStats.avg}kg
                </p>
                <p className="text-sm text-gray-600">Peso Médio</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {weightStats.max}kg
                </p>
                <p className="text-sm text-gray-600">Peso Máximo</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {sortedWeightHistory.length}
                </p>
                <p className="text-sm text-gray-600">Registros</p>
              </div>
            </div>
          )}

          {/* Lista de Registros de Peso */}
          {sortedWeightHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Registros de Peso</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedWeightHistory.slice().reverse().map((entry) => {
                  if (!entry || typeof entry.weight !== 'number') return null;
                  
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Scale className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{entry.weight} kg</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(entry.date).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeWeightEntry(entry.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Adicionar Nova Medida de Cintura */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Ruler className="w-5 h-5 mr-2 text-orange-500" />
              Registrar Medida da Cintura
            </h3>
            
            <form onSubmit={handleAddWaist} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cintura (cm)
                </label>
                <input
                  type="number"
                  value={newWaist}
                  onChange={(e) => setNewWaist(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Digite a medida da sua cintura"
                  min="50"
                  max="200"
                  step="0.1"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={!addWaistEntry}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar Cintura
              </button>
            </form>
          </div>

          {/* Tendência da Cintura */}
          {waistTrend && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tendência da Cintura</h3>
                  <p className="text-sm text-gray-600">Comparado ao último registro</p>
                </div>
                <div className="flex items-center space-x-2">
                  {waistTrend.trend === 'up' && (
                    <>
                      <TrendingUp className="w-6 h-6 text-red-500" />
                      <span className="text-red-600 font-semibold">+{waistTrend.difference.toFixed(1)} cm</span>
                    </>
                  )}
                  {waistTrend.trend === 'down' && (
                    <>
                      <TrendingDown className="w-6 h-6 text-green-500" />
                      <span className="text-green-600 font-semibold">-{waistTrend.difference.toFixed(1)} cm</span>
                    </>
                  )}
                  {waistTrend.trend === 'stable' && (
                    <span className="text-gray-600 font-semibold">Estável</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gráfico da Cintura */}
          {sortedWaistHistory.length > 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Evolução da Cintura</h3>
              <WaistChart />
            </div>
          )}

          {/* Estatísticas da Cintura */}
          {waistStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mx-4">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {sortedWaistHistory[sortedWaistHistory.length - 1]?.waist || 0}cm
                </p>
                <p className="text-sm text-gray-600">Cintura Atual</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {waistStats.avg}cm
                </p>
                <p className="text-sm text-gray-600">Cintura Média</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {waistStats.max}cm
                </p>
                <p className="text-sm text-gray-600">Cintura Máxima</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {sortedWaistHistory.length}
                </p>
                <p className="text-sm text-gray-600">Registros</p>
              </div>
            </div>
          )}

          {/* Lista de Registros de Cintura */}
          {sortedWaistHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Registros de Cintura</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedWaistHistory.slice().reverse().map((entry) => {
                  if (!entry || typeof entry.waist !== 'number') return null;
                  
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <Ruler className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{entry.waist} cm</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(entry.date).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {removeWaistEntry && (
                        <button
                          onClick={() => removeWaistEntry(entry.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado Vazio para Cintura */}
          {sortedWaistHistory.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center mx-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-200 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum Registro de Cintura</h3>
              <p className="text-gray-600">Comece registrando a medida da sua cintura para acompanhar sua evolução.</p>
            </div>
          )}
        </>
      )}

      {/* Estado Vazio Geral */}
      {sortedWeightHistory.length === 0 && activeTab === 'weight' && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum Registro</h3>
          <p className="text-gray-600">Comece registrando seu peso atual para acompanhar sua evolução.</p>
        </div>
      )}
    </div>
  );
};

export default WeightHistory;