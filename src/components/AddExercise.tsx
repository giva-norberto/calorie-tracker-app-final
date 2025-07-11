import React, { useState } from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { ExerciseEntry, DailyData } from '../types';

interface AddExerciseProps {
  dailyData: DailyData;
  addExercise: (exercise: Omit<ExerciseEntry, 'id' | 'timestamp'>) => void;
  removeExercise: (date: string, exerciseId: number) => void;
  currentDate: string;
}

const AddExercise: React.FC<AddExerciseProps> = ({ 
  dailyData, 
  addExercise, 
  removeExercise, 
  currentDate 
}) => {
  const [exerciseName, setExerciseName] = useState('');
  const [calories, setCalories] = useState('');

  const totalBurned = dailyData.exercises.reduce((sum, exercise) => sum + exercise.calories, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseName.trim() || !calories) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    addExercise({
      name: exerciseName.trim(),
      calories: parseInt(calories)
    });

    // Resetar formulário
    setExerciseName('');
    setCalories('');
  };

  const commonExercises = [
    { name: 'Corrida (moderada)', calories: 400 },
    { name: 'Ciclismo', calories: 300 },
    { name: 'Natação', calories: 350 },
    { name: 'Musculação', calories: 250 },
    { name: 'Caminhada', calories: 150 },
    { name: 'Yoga', calories: 120 },
    { name: 'Dança', calories: 200 },
    { name: 'Basquete', calories: 350 },
  ];

  const selectCommonExercise = (exercise: { name: string; calories: number }) => {
    setExerciseName(exercise.name);
    setCalories(exercise.calories.toString());
  };

  // Formatar data corretamente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Adicionar Exercício</h2>
        <p className="text-gray-600">Registre seus treinos para {formatDate(currentDate)}</p>
      </div>

      {/* Formulário de Adicionar Exercício */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Exercício */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Nome do Exercício
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="ex: Corrida, Natação, Musculação"
              required
            />
          </div>

          {/* Calorias Queimadas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calorias Queimadas
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Digite as calorias queimadas"
              min="1"
              required
            />
          </div>

          {/* Botão Enviar */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Exercício
          </button>
        </form>
      </div>

      {/* Exercícios Comuns */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Adição Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {commonExercises.map((exercise, index) => (
            <button
              key={index}
              onClick={() => selectCommonExercise(exercise)}
              className="p-4 text-left bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <p className="font-semibold text-gray-900 text-sm">{exercise.name}</p>
              <p className="text-blue-600 font-medium text-xs">{exercise.calories} kcal</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exercícios de Hoje */}
      {dailyData.exercises.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Exercícios de Hoje</h3>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold">
              {totalBurned} kcal queimadas
            </div>
          </div>
          
          <div className="space-y-3">
            {dailyData.exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(exercise.timestamp).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{exercise.calories} kcal</p>
                  </div>
                  <button
                    onClick={() => removeExercise(currentDate, exercise.id)}
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
    </div>
  );
};

export default AddExercise;