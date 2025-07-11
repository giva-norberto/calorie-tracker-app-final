import React, { useState } from 'react';
import { Target, Zap, Activity, Wheat, Droplets, Save, TrendingUp, Award } from 'lucide-react';
import { MacroGoals as MacroGoalsType, DailyData, NutritionInfo } from '../types';

interface MacroGoalsProps {
  macroGoals: MacroGoalsType;
  updateMacroGoals: (goals: Partial<MacroGoalsType>) => void;
  dailyData: DailyData;
  currentDate: string;
}

const MacroGoals: React.FC<MacroGoalsProps> = ({
  macroGoals,
  updateMacroGoals,
  dailyData,
  currentDate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [tempGoals, setTempGoals] = useState(macroGoals);

  // Calcular totais diários
  const calculateDailyTotals = (): NutritionInfo => {
    return dailyData.foods.reduce((totals, food) => {
      const nutrition = food.nutrition || {
        calories: food.calories,
        protein: food.calories * 0.15 / 4, // Estimativa: 15% das calorias de proteína
        carbs: food.calories * 0.55 / 4, // Estimativa: 55% das calorias de carboidratos
        fat: food.calories * 0.30 / 9, // Estimativa: 30% das calorias de gordura
        fiber: food.calories * 0.01, // Estimativa
        sugar: food.calories * 0.1 / 4, // Estimativa
        sodium: food.calories * 0.5 // Estimativa
      };

      return {
        calories: totals.calories + (nutrition.calories * food.quantity),
        protein: totals.protein + (nutrition.protein * food.quantity),
        carbs: totals.carbs + (nutrition.carbs * food.quantity),
        fat: totals.fat + (nutrition.fat * food.quantity),
        fiber: totals.fiber + (nutrition.fiber * food.quantity),
        sugar: totals.sugar + (nutrition.sugar * food.quantity),
        sodium: totals.sodium + (nutrition.sodium * food.quantity)
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });
  };

  const dailyTotals = calculateDailyTotals();

  const handleSave = () => {
    updateMacroGoals(tempGoals);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempGoals(macroGoals);
    setEditMode(false);
  };

  const macroData = [
    {
      name: 'Calorias',
      current: Math.round(dailyTotals.calories),
      goal: macroGoals.calories,
      unit: 'kcal',
      color: 'from-red-500 to-orange-500',
      bgColor: 'from-red-50 to-orange-50',
      icon: Zap
    },
    {
      name: 'Proteínas',
      current: Math.round(dailyTotals.protein),
      goal: macroGoals.protein,
      unit: 'g',
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50',
      icon: Activity
    },
    {
      name: 'Carboidratos',
      current: Math.round(dailyTotals.carbs),
      goal: macroGoals.carbs,
      unit: 'g',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      icon: Wheat
    },
    {
      name: 'Gorduras',
      current: Math.round(dailyTotals.fat),
      goal: macroGoals.fat,
      unit: 'g',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      icon: Droplets
    }
  ];

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Metas de Macronutrientes</h2>
        <p className="text-gray-600">Acompanhe suas metas nutricionais para {formatDate(currentDate)}</p>
      </div>

      {/* Configuração de Metas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Configurar Metas</h3>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Editar Metas
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {editMode ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Calorias (kcal)</label>
              <input
                type="number"
                value={tempGoals.calories}
                onChange={(e) => setTempGoals({...tempGoals, calories: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proteínas (g)</label>
              <input
                type="number"
                value={tempGoals.protein}
                onChange={(e) => setTempGoals({...tempGoals, protein: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Carboidratos (g)</label>
              <input
                type="number"
                value={tempGoals.carbs}
                onChange={(e) => setTempGoals({...tempGoals, carbs: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gorduras (g)</label>
              <input
                type="number"
                value={tempGoals.fat}
                onChange={(e) => setTempGoals({...tempGoals, fat: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {macroData.map((macro) => (
              <div key={macro.name} className={`bg-gradient-to-br ${macro.bgColor} rounded-xl p-4 text-center`}>
                <p className="text-sm font-medium text-gray-600 mb-1">{macro.name}</p>
                <p className="text-lg font-bold text-gray-900">{macro.goal} {macro.unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progresso dos Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
        {macroData.map((macro) => {
          const Icon = macro.icon;
          const percentage = macro.goal > 0 ? Math.min((macro.current / macro.goal) * 100, 100) : 0;
          const isComplete = macro.current >= macro.goal;
          
          return (
            <div key={macro.name} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${macro.color} mr-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{macro.name}</h3>
                    <p className="text-sm text-gray-600">
                      {macro.current} / {macro.goal} {macro.unit}
                    </p>
                  </div>
                </div>
                {isComplete && (
                  <div className="flex items-center text-green-600">
                    <Award className="w-5 h-5 mr-1" />
                    <span className="text-sm font-semibold">Meta!</span>
                  </div>
                )}
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${macro.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{Math.round(percentage)}% da meta</span>
                <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                  {macro.goal - macro.current > 0 ? `Faltam ${macro.goal - macro.current} ${macro.unit}` : 'Meta atingida!'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Nutricional Detalhado */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
          Resumo Nutricional Detalhado
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{Math.round(dailyTotals.fiber)}g</p>
            <p className="text-sm text-gray-600">Fibras</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-600">{Math.round(dailyTotals.sugar)}g</p>
            <p className="text-sm text-gray-600">Açúcares</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{Math.round(dailyTotals.sodium)}mg</p>
            <p className="text-sm text-gray-600">Sódio</p>
          </div>
        </div>
      </div>

      {/* Dicas Nutricionais */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mx-4 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-500" />
          💡 Dicas Nutricionais
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Proteínas:</strong> 1.6-2.2g por kg de peso corporal para atletas</p>
          <p><strong>Carboidratos:</strong> 45-65% das calorias totais diárias</p>
          <p><strong>Gorduras:</strong> 20-35% das calorias totais diárias</p>
          <p><strong>Fibras:</strong> 25-35g por dia para adultos</p>
        </div>
      </div>
    </div>
  );
};

export default MacroGoals;