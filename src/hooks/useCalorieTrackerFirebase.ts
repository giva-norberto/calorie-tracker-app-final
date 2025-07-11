// Arquivo: src/hooks/useCalorieTrackerFirebase.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { UserInfo, FoodItem, ExerciseEntry, TrackerData, DailyData, WeightEntry, WaistEntry, MacroGoals, Recipe, BarcodeProduct, Alert } from '../types';

// Seus valores padrão...
const defaultUserInfo: UserInfo = {
  age: '', gender: '', height: '', weight: '', activityLevel: 'sedentary'
};
const defaultMacroGoals: MacroGoals = {
  calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 25
};

// Hook Corrigido e Otimizado
const useCalorieTrackerFirebase = () => {
  const { user } = useAuth();
  const { saveDocument, getDocument, deleteDocument, subscribeToCollection, loading: firestoreLoading, error: firestoreError } = useFirestore(user);
  
  const [data, setData] = useState<TrackerData>({
    userInfo: defaultUserInfo,
    dailyData: {},
    weightHistory: [],
    waistHistory: [],
    macroGoals: defaultMacroGoals,
    recipes: [],
    alerts: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getCurrentLocalDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [currentDate, setCurrentDate] = useState(getCurrentLocalDate);
  const [viewedDate, setViewedDate] = useState(getCurrentLocalDate);
  
  // Seus useEffects de carregamento e subscrição permanecem os mesmos...
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [userProfile, macroGoalsData] = await Promise.all([
                getDocument('profile', 'info'),
                getDocument('profile', 'macroGoals')
            ]);
            setData(prev => ({
                ...prev,
                userInfo: { ...defaultUserInfo, ...userProfile },
                macroGoals: { ...defaultMacroGoals, ...macroGoalsData }
            }));
        } catch (e) {
            console.error("Erro ao carregar dados iniciais:", e);
            setError("Falha ao carregar perfil.");
        } finally {
            setLoading(false);
        }
    };
    loadInitialData();
  }, [user, getDocument]);

  useEffect(() => {
      if (!user) return;
      const collections = {
          weightHistory: 'date',
          waistHistory: 'date',
          recipes: 'createdAt',
          alerts: 'timestamp',
      };
      const unsubs = Object.entries(collections).map(([key, orderBy]) => 
          subscribeToCollection(key, (collectionData) => {
              setData(prev => ({ ...prev, [key]: collectionData || [] }));
          }, orderBy)
      );
      return () => unsubs.forEach(unsub => unsub());
  }, [user, subscribeToCollection]);

  useEffect(() => {
      if (!user || !currentDate) return;
      const subcollections = ['foods', 'exercises'];
      const unsubs = subcollections.map(sub => 
          subscribeToCollection(`dailyData/${currentDate}/${sub}`, (collectionData) => {
              setData(prev => ({
                  ...prev,
                  dailyData: {
                      ...prev.dailyData,
                      [currentDate]: {
                          ...prev.dailyData[currentDate],
                          [sub]: collectionData || []
                      }
                  }
              }));
          }, 'timestamp')
      );
      return () => unsubs.forEach(unsub => unsub());
  }, [user, currentDate, subscribeToCollection]);

  // *** CORREÇÃO PRINCIPAL ABAIXO ***

  // Os cálculos já estão corretos com useMemo, ótimo trabalho!
  const calculations = useMemo(() => {
    const { age, gender, height, weight, activityLevel, bodyFat } = data.userInfo;
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const bodyFatNum = parseFloat(bodyFat || '0');

    if (!ageNum || !heightNum || !weightNum || !gender) {
      return { bmi: 0, bmr: 0, tdee: 0, bmiCategory: '' };
    }

    const heightM = heightNum / 100;
    const bmi = weightNum / (heightM * heightM);
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Abaixo do Peso';
    else if (bmi < 25) bmiCategory = 'Peso Normal';
    else if (bmi < 30) bmiCategory = 'Sobrepeso';
    else bmiCategory = 'Obesidade';

    let bmr = 0;
    if (bodyFatNum > 0) {
      const leanMass = weightNum * (1 - bodyFatNum / 100);
      bmr = 370 + (21.6 * leanMass);
    } else {
      if (gender === 'male') {
        bmr = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
      } else {
        bmr = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
      }
    }
    const multipliers = { sedentary: 1.2, lightlyActive: 1.375, moderatelyActive: 1.55, veryActive: 1.725, extraActive: 1.9 };
    const tdee = bmr * multipliers[activityLevel];
    return { bmi: Math.round(bmi * 10) / 10, bmr: Math.round(bmr), tdee: Math.round(tdee), bmiCategory };
  }, [data.userInfo]);

  // **MUDANÇA 1: ATUALIZAÇÃO OTIMISTA E FUNÇÃO ESTABILIZADA COM useCallback**
  const updateUserInfo = useCallback(async (userInfoUpdate: Partial<UserInfo>) => {
    const updatedInfo = { ...data.userInfo, ...userInfoUpdate };
    
    // ATUALIZA A TELA IMEDIATAMENTE (Otimista)
    setData(prev => ({ ...prev, userInfo: updatedInfo }));
    
    try {
      // SALVA NO FIREBASE EM SEGUNDO PLANO
      await saveDocument('profile', updatedInfo, 'info');
    } catch (error: any) {
      console.error('Erro ao salvar informações do usuário:', error);
      setError('Erro ao salvar informações. Tente novamente.');
      // Opcional: reverter a mudança se o salvamento falhar
      // setData(prev => ({...prev, userInfo: data.userInfo}));
    }
  }, [data.userInfo, saveDocument]);

  // **MUDANÇA 2: ESTABILIZAR TODAS AS OUTRAS FUNÇÕES COM useCallback**
  const getDailyData = useCallback((date: string): DailyData => {
    return data.dailyData[date] || { foods: [], exercises: [] };
  }, [data.dailyData]);

  const addFood = useCallback(async (food: Omit<FoodItem, 'id' | 'timestamp'>) => {
    const newFood = { ...food, timestamp: new Date().toISOString() };
    try {
      await saveDocument(`dailyData/${currentDate}/foods`, newFood);
    } catch (e: any) {
      setError('Falha ao adicionar comida.');
    }
  }, [currentDate, saveDocument]);

  const removeFood = useCallback(async (date: string, foodId: string) => {
    try {
      await deleteDocument(`dailyData/${date}/foods`, foodId);
    } catch (e: any) {
      setError('Falha ao remover comida.');
    }
  }, [deleteDocument]);
  
  // ... adicione useCallback para TODAS as outras funções que seu hook retorna
  // Exemplo:
  const addExercise = useCallback(async (exercise: Omit<ExerciseEntry, 'id' | 'timestamp'>) => {
    const newExercise = { ...exercise, timestamp: new Date().toISOString() };
    try {
        await saveDocument(`dailyData/${currentDate}/exercises`, newExercise);
    } catch(e: any) {
        setError('Falha ao adicionar exercício.');
    }
  }, [currentDate, saveDocument]);

  // Restante das suas funções...
  
  return {
    data,
    calculations,
    currentDate,
    viewedDate,
    setViewedDate,
    getDailyData,
    updateUserInfo, // Agora é a versão otimizada
    addFood, // Agora é a versão otimizada
    removeFood, // Agora é a versão otimizada
    addExercise, // Agora é a versão otimizada
    // ...retorne todas as outras funções
    loading: loading || firestoreLoading,
    error: error || firestoreError
  };
};

export default useCalorieTrackerFirebase;
