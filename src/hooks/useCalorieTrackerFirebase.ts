import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { UserInfo, FoodItem, ExerciseEntry, TrackerData, DailyData, WeightEntry, WaistEntry, MacroGoals, Recipe, BarcodeProduct, Alert } from '../types';

const defaultUserInfo: UserInfo = {
  age: '',
  gender: '',
  height: '',
  weight: '',
  activityLevel: 'sedentary'
};

const defaultMacroGoals: MacroGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
  fiber: 25
};

// Cache para busca de calorias por IA
const caloriesCache = new Map<string, number>();

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

  // Função para obter data local correta
  const getCurrentLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [currentDate, setCurrentDate] = useState(getCurrentLocalDate);
  const [viewedDate, setViewedDate] = useState(getCurrentLocalDate);

  // Atualizar data atual a cada minuto
  useEffect(() => {
    const updateCurrentDate = () => {
      const newDate = getCurrentLocalDate();
      setCurrentDate(newDate);
    };

    const interval = setInterval(updateCurrentDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Carregar dados iniciais do usuário
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar perfil do usuário
        try {
          const userProfile = await getDocument('profile', 'info');
          if (userProfile) {
            setData(prev => ({ ...prev, userInfo: { ...defaultUserInfo, ...userProfile } }));
          }
        } catch (err) {
          console.warn('Perfil do usuário não encontrado, usando padrão');
        }

        // Carregar metas de macronutrientes
        try {
          const macroGoals = await getDocument('profile', 'macroGoals');
          if (macroGoals) {
            setData(prev => ({ ...prev, macroGoals: { ...defaultMacroGoals, ...macroGoals } }));
          }
        } catch (err) {
          console.warn('Metas de macronutrientes não encontradas, usando padrão');
        }

      } catch (error: any) {
        console.error('Erro ao carregar dados do usuário:', error);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Subscrever a mudanças em tempo real
  useEffect(() => {
    if (!user) return;

    const unsubscribes: (() => void)[] = [];

    try {
      // Histórico de peso
      const unsubWeights = subscribeToCollection('weightHistory', (weights) => {
        setData(prev => ({ ...prev, weightHistory: weights || [] }));
      }, 'date');
      unsubscribes.push(unsubWeights);

      // Histórico de cintura
      const unsubWaist = subscribeToCollection('waistHistory', (waist) => {
        setData(prev => ({ ...prev, waistHistory: waist || [] }));
      }, 'date');
      unsubscribes.push(unsubWaist);

      // Receitas
      const unsubRecipes = subscribeToCollection('recipes', (recipes) => {
        setData(prev => ({ ...prev, recipes: recipes || [] }));
      }, 'createdAt');
      unsubscribes.push(unsubRecipes);

      // Alertas
      const unsubAlerts = subscribeToCollection('alerts', (alerts) => {
        setData(prev => ({ ...prev, alerts: alerts || [] }));
      }, 'timestamp');
      unsubscribes.push(unsubAlerts);

    } catch (error) {
      console.error('Erro ao configurar subscrições:', error);
    }

    return () => {
      unsubscribes.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.warn('Erro ao cancelar subscrição:', err);
        }
      });
    };
  }, [user]);

  // Carregar dados diários quando a data muda
  useEffect(() => {
    if (!user) return;

    const unsubscribes: (() => void)[] = [];

    try {
      // Carregar alimentos do dia
      const unsubFoods = subscribeToCollection(`dailyData/${currentDate}/foods`, (foods) => {
        setData(prev => ({
          ...prev,
          dailyData: {
            ...prev.dailyData,
            [currentDate]: {
              ...prev.dailyData[currentDate],
              foods: foods || []
            }
          }
        }));
      }, 'timestamp');
      unsubscribes.push(unsubFoods);

      // Carregar exercícios do dia
      const unsubExercises = subscribeToCollection(`dailyData/${currentDate}/exercises`, (exercises) => {
        setData(prev => ({
          ...prev,
          dailyData: {
            ...prev.dailyData,
            [currentDate]: {
              ...prev.dailyData[currentDate],
              exercises: exercises || []
            }
          }
        }));
      }, 'timestamp');
      unsubscribes.push(unsubExercises);

    } catch (error) {
      console.error('Erro ao carregar dados diários:', error);
    }

    return () => {
      unsubscribes.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.warn('Erro ao cancelar subscrição diária:', err);
        }
      });
    };
  }, [user, currentDate]);

  // Calcular IMC, TMB e TDEE
  const calculations = useMemo(() => {
    try {
      const { age, gender, height, weight, activityLevel, bodyFat } = data.userInfo;
      const ageNum = parseInt(age);
      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);
      const bodyFatNum = parseFloat(bodyFat || '0');

      if (!ageNum || !heightNum || !weightNum || !gender) {
        return { bmi: 0, bmr: 0, tdee: 0, bmiCategory: '' };
      }

      // Cálculo do IMC
      const heightM = heightNum / 100;
      const bmi = weightNum / (heightM * heightM);

      let bmiCategory = '';
      if (bmi < 18.5) bmiCategory = 'Abaixo do Peso';
      else if (bmi < 25) bmiCategory = 'Peso Normal';
      else if (bmi < 30) bmiCategory = 'Sobrepeso';
      else if (bmi < 35) bmiCategory = 'Obesidade Grau I';
      else if (bmi < 40) bmiCategory = 'Obesidade Grau II';
      else bmiCategory = 'Obesidade Grau III';

      // Cálculo da TMB
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

      // Cálculo do TDEE
      const multipliers = {
        sedentary: 1.2,
        lightlyActive: 1.375,
        moderatelyActive: 1.55,
        veryActive: 1.725,
        extraActive: 1.9
      };

      const tdee = bmr * multipliers[activityLevel];

      return {
        bmi: Math.round(bmi * 10) / 10,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmiCategory
      };
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      return { bmi: 0, bmr: 0, tdee: 0, bmiCategory: '' };
    }
  }, [data.userInfo]);

  // Obter dados diários para uma data específica
  const getDailyData = (date: string): DailyData => {
    try {
      return data.dailyData[date] || { foods: [], exercises: [] };
    } catch (error) {
      console.error('Erro ao obter dados diários:', error);
      return { foods: [], exercises: [] };
    }
  };

  // Atualizar informações do usuário
  const updateUserInfo = async (userInfo: Partial<UserInfo>) => {
    try {
      const updatedInfo = { ...data.userInfo, ...userInfo };
      await saveDocument('profile', updatedInfo, 'info');
      setData(prev => ({ ...prev, userInfo: updatedInfo }));
    } catch (error: any) {
      console.error('Erro ao atualizar informações do usuário:', error);
      setError('Erro ao salvar informações do usuário');
    }
  };

  // Atualizar metas de macronutrientes
  const updateMacroGoals = async (goals: Partial<MacroGoals>) => {
    try {
      const updatedGoals = { ...data.macroGoals, ...goals };
      await saveDocument('profile', updatedGoals, 'macroGoals');
      setData(prev => ({ ...prev, macroGoals: updatedGoals }));
    } catch (error: any) {
      console.error('Erro ao atualizar metas de macronutrientes:', error);
      setError('Erro ao salvar metas de macronutrientes');
    }
  };

  // Buscar calorias por IA
  const searchCaloriesWithAI = async (foodName: string): Promise<number> => {
    try {
      const normalizedName = foodName.toLowerCase().trim();
      
      if (caloriesCache.has(normalizedName)) {
        return caloriesCache.get(normalizedName)!;
      }

      // Base de dados local expandida
      const foodDatabase: Record<string, number> = {
        'maçã': 52, 'banana': 89, 'laranja': 47, 'pêra': 57, 'uva': 62,
        'morango': 32, 'abacaxi': 50, 'manga': 60, 'kiwi': 61, 'melancia': 30,
        'brócolis': 34, 'cenoura': 41, 'tomate': 18, 'alface': 15, 'pepino': 16,
        'arroz': 130, 'arroz integral': 111, 'macarrão': 131, 'pão': 265,
        'peito de frango': 165, 'carne bovina': 250, 'peixe': 206, 'salmão': 208,
        'ovo': 155, 'leite': 42, 'queijo': 113, 'iogurte': 59,
        'batata': 77, 'batata doce': 86, 'feijão': 127, 'lentilha': 116
      };

      let calories = 0;
      
      if (foodDatabase[normalizedName]) {
        calories = foodDatabase[normalizedName];
      } else {
        for (const [food, cals] of Object.entries(foodDatabase)) {
          if (normalizedName.includes(food) || food.includes(normalizedName)) {
            calories = cals;
            break;
          }
        }
      }

      if (calories === 0) {
        if (normalizedName.includes('fruta')) calories = 50;
        else if (normalizedName.includes('vegetal') || normalizedName.includes('salada')) calories = 25;
        else if (normalizedName.includes('carne') || normalizedName.includes('frango') || normalizedName.includes('peixe')) calories = 200;
        else if (normalizedName.includes('arroz') || normalizedName.includes('pão')) calories = 150;
        else calories = 100;
      }

      caloriesCache.set(normalizedName, calories);
      return calories;
    } catch (error) {
      console.error('Erro na busca de calorias:', error);
      return 100;
    }
  };

  // Adicionar item de comida
  const addFood = async (food: Omit<FoodItem, 'id' | 'timestamp'>) => {
    try {
      const newFood = {
        ...food,
        timestamp: new Date().toISOString()
      };

      await saveDocument(`dailyData/${currentDate}/foods`, newFood);
    } catch (error: any) {
      console.error('Erro ao adicionar comida:', error);
      setError('Erro ao adicionar comida');
    }
  };

  // Adicionar comida a partir de produto escaneado
  const addFoodFromBarcode = async (product: BarcodeProduct, quantity: number) => {
    try {
      const food: Omit<FoodItem, 'id' | 'timestamp'> = {
        name: product.name,
        calories: Math.round(product.nutrition.calories / product.servingSize),
        quantity: quantity,
        unit: product.servingUnit,
        nutrition: {
          calories: product.nutrition.calories / product.servingSize,
          protein: product.nutrition.protein / product.servingSize,
          carbs: product.nutrition.carbs / product.servingSize,
          fat: product.nutrition.fat / product.servingSize,
          fiber: product.nutrition.fiber / product.servingSize,
          sugar: product.nutrition.sugar / product.servingSize,
          sodium: product.nutrition.sodium / product.servingSize
        },
        barcode: product.barcode
      };

      await addFood(food);
    } catch (error: any) {
      console.error('Erro ao adicionar comida do código de barras:', error);
      setError('Erro ao adicionar produto escaneado');
    }
  };

  // Remover item de comida
  const removeFood = async (date: string, foodId: string) => {
    try {
      await deleteDocument(`dailyData/${date}/foods`, foodId);
    } catch (error: any) {
      console.error('Erro ao remover comida:', error);
      setError('Erro ao remover comida');
    }
  };

  // Adicionar exercício
  const addExercise = async (exercise: Omit<ExerciseEntry, 'id' | 'timestamp'>) => {
    try {
      const newExercise = {
        ...exercise,
        timestamp: new Date().toISOString()
      };

      await saveDocument(`dailyData/${currentDate}/exercises`, newExercise);
    } catch (error: any) {
      console.error('Erro ao adicionar exercício:', error);
      setError('Erro ao adicionar exercício');
    }
  };

  // Remover exercício
  const removeExercise = async (date: string, exerciseId: string) => {
    try {
      await deleteDocument(`dailyData/${date}/exercises`, exerciseId);
    } catch (error: any) {
      console.error('Erro ao remover exercício:', error);
      setError('Erro ao remover exercício');
    }
  };

  // Adicionar entrada de peso
  const addWeightEntry = async (weight: number) => {
    try {
      const newEntry = {
        weight,
        date: currentDate
      };

      await saveDocument('weightHistory', newEntry);
      await updateUserInfo({ weight: weight.toString() });
    } catch (error: any) {
      console.error('Erro ao adicionar peso:', error);
      setError('Erro ao adicionar peso');
    }
  };

  // Remover entrada de peso
  const removeWeightEntry = async (id: string) => {
    try {
      await deleteDocument('weightHistory', id);
    } catch (error: any) {
      console.error('Erro ao remover peso:', error);
      setError('Erro ao remover peso');
    }
  };

  // Adicionar entrada de cintura
  const addWaistEntry = async (waist: number) => {
    try {
      const newEntry = {
        waist,
        date: currentDate
      };

      await saveDocument('waistHistory', newEntry);
      await updateUserInfo({ waist: waist.toString() });
    } catch (error: any) {
      console.error('Erro ao adicionar cintura:', error);
      setError('Erro ao adicionar medida da cintura');
    }
  };

  // Remover entrada de cintura
  const removeWaistEntry = async (id: string) => {
    try {
      await deleteDocument('waistHistory', id);
    } catch (error: any) {
      console.error('Erro ao remover cintura:', error);
      setError('Erro ao remover medida da cintura');
    }
  };

  // Adicionar receita
  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      const newRecipe = {
        ...recipe,
        createdAt: new Date().toISOString()
      };

      await saveDocument('recipes', newRecipe);
    } catch (error: any) {
      console.error('Erro ao adicionar receita:', error);
      setError('Erro ao adicionar receita');
    }
  };

  // Remover receita
  const removeRecipe = async (id: string) => {
    try {
      await deleteDocument('recipes', id);
    } catch (error: any) {
      console.error('Erro ao remover receita:', error);
      setError('Erro ao remover receita');
    }
  };

  // Adicionar comida a partir de receita
  const addFoodFromRecipe = async (recipe: Recipe, servings: number) => {
    try {
      const caloriesPerServing = recipe.totalNutrition.calories / recipe.servings;
      
      const food: Omit<FoodItem, 'id' | 'timestamp'> = {
        name: `${recipe.name} (Receita)`,
        calories: Math.round(caloriesPerServing),
        quantity: servings,
        unit: 'porção',
        nutrition: {
          calories: caloriesPerServing,
          protein: recipe.totalNutrition.protein / recipe.servings,
          carbs: recipe.totalNutrition.carbs / recipe.servings,
          fat: recipe.totalNutrition.fat / recipe.servings,
          fiber: recipe.totalNutrition.fiber / recipe.servings,
          sugar: recipe.totalNutrition.sugar / recipe.servings,
          sodium: recipe.totalNutrition.sodium / recipe.servings
        }
      };

      await addFood(food);
    } catch (error: any) {
      console.error('Erro ao adicionar comida da receita:', error);
      setError('Erro ao adicionar receita ao diário');
    }
  };

  // Adicionar alerta
  const addAlert = async (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    try {
      const newAlert = {
        ...alert,
        timestamp: new Date().toISOString(),
        read: false
      };

      await saveDocument('alerts', newAlert);
    } catch (error: any) {
      console.error('Erro ao adicionar alerta:', error);
      setError('Erro ao adicionar alerta');
    }
  };

  // Marcar alerta como lido
  const markAlertAsRead = async (id: string) => {
    try {
      const alert = data.alerts.find(a => a.id === id);
      if (alert) {
        await saveDocument('alerts', { ...alert, read: true }, id);
      }
    } catch (error: any) {
      console.error('Erro ao marcar alerta como lido:', error);
      setError('Erro ao atualizar alerta');
    }
  };

  // Resetar todos os dados
  const resetData = async () => {
    try {
      setData({
        userInfo: defaultUserInfo,
        dailyData: {},
        weightHistory: [],
        waistHistory: [],
        macroGoals: defaultMacroGoals,
        recipes: [],
        alerts: []
      });
      caloriesCache.clear();
    } catch (error: any) {
      console.error('Erro ao resetar dados:', error);
      setError('Erro ao resetar dados');
    }
  };

  return {
    data,
    calculations,
    currentDate,
    viewedDate,
    setViewedDate,
    getDailyData,
    updateUserInfo,
    updateMacroGoals,
    addFood,
    addFoodFromBarcode,
    removeFood,
    addExercise,
    removeExercise,
    addWeightEntry,
    removeWeightEntry,
    addWaistEntry,
    removeWaistEntry,
    addRecipe,
    removeRecipe,
    addFoodFromRecipe,
    addAlert,
    markAlertAsRead,
    searchCaloriesWithAI,
    resetData,
    loading: loading || firestoreLoading,
    error: error || firestoreError
  };
};

export default useCalorieTrackerFirebase;