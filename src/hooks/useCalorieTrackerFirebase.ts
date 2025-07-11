// Arquivo: src/hooks/useCalorieTrackerFirebase.ts (VERSÃO DE TESTE FINAL - SEM FIREBASE)

import { UserInfo, TrackerData, DailyData, MacroGoals } from '../types';

// --- Dados 100% falsos e fixos para o teste ---
const fakeUserInfo: UserInfo = {
  age: '30', gender: 'male', height: '180', weight: '85',
  activityLevel: 'sedentary', goalWeight: '80', weeklyGoal: '0.5',
  bodyFat: '20', leanMass: '68', bodyType: 'mesomorfo', waist: '90'
};

const fakeData: TrackerData = {
  userInfo: fakeUserInfo,
  dailyData: {
    '2025-07-11': {
      foods: [{ id: '1', name: 'Maçã', calories: 95, quantity: 1, unit: 'unidade' }],
      exercises: [{ id: '1', name: 'Caminhada', duration: 30, caloriesBurned: 150 }]
    }
  },
  weightHistory: [],
  waistHistory: [],
  macroGoals: { calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 25 },
  recipes: [],
  alerts: [{id: '1', message: 'Alerta de teste!', type: 'info', read: false}]
};

const fakeCalculations = { bmi: 26.2, bmr: 1826, tdee: 2191, bmiCategory: 'Sobrepeso' };


// --- O Hook Falso ---
// Este hook não faz NADA assíncrono. Ele retorna os dados falsos imediatamente.
export default function useCalorieTrackerFirebase() {
  console.log("EXECUTANDO O HOOK DE TESTE (FAKE). Nenhuma chamada ao Firebase foi feita.");

  return {
    loading: false, // <-- FORÇADO PARA FALSE
    error: null,    // <-- FORÇADO PARA NULL
    data: fakeData,
    calculations: fakeCalculations,
    
    // Funções falsas para evitar que o App quebre ao tentar chamá-las
    updateUserInfo: (info: any) => console.log("Tentativa de atualizar usuário:", info),
    getDailyData: (date: any) => fakeData.dailyData['2025-07-11'] || { foods: [], exercises: [] },
    // Adicione outras funções que seu App.tsx chama com um console.log
    setViewedDate: () => {},
    addFood: () => {},
    removeFood: () => {},
    addExercise: () => {},
    removeExercise: () => {},
    updateMacroGoals: () => {},
    // ...etc
  };
}
