import { useState, useEffect, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
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

const useCalorieTracker = () => {
  const [data, setData] = useLocalStorage<TrackerData>('calorieTracker', {
    userInfo: defaultUserInfo,
    dailyData: {},
    weightHistory: [],
    waistHistory: [],
    macroGoals: defaultMacroGoals,
    recipes: [],
    alerts: []
  });

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

    const interval = setInterval(updateCurrentDate, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  // Garantir que todos os dados sejam válidos
  const safeData = useMemo(() => {
    try {
      return {
        ...data,
        weightHistory: Array.isArray(data.weightHistory) ? data.weightHistory : [],
        waistHistory: Array.isArray(data.waistHistory) ? data.waistHistory : [],
        dailyData: data.dailyData || {},
        userInfo: data.userInfo || defaultUserInfo,
        macroGoals: data.macroGoals || defaultMacroGoals,
        recipes: Array.isArray(data.recipes) ? data.recipes : [],
        alerts: Array.isArray(data.alerts) ? data.alerts : []
      };
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      return {
        userInfo: defaultUserInfo,
        dailyData: {},
        weightHistory: [],
        waistHistory: [],
        macroGoals: defaultMacroGoals,
        recipes: [],
        alerts: []
      };
    }
  }, [data]);

  // Calcular IMC, TMB e TDEE
  const calculations = useMemo(() => {
    try {
      const { age, gender, height, weight, activityLevel, bodyFat } = safeData.userInfo;
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

      // Cálculo da TMB (usar Katch-McArdle se % gordura disponível)
      let bmr = 0;
      if (bodyFatNum > 0) {
        // Fórmula Katch-McArdle (mais precisa)
        const leanMass = weightNum * (1 - bodyFatNum / 100);
        bmr = 370 + (21.6 * leanMass);
      } else {
        // Fórmula Harris-Benedict revisada
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
  }, [safeData.userInfo]);

  // Obter dados diários para uma data específica
  const getDailyData = (date: string): DailyData => {
    try {
      return safeData.dailyData[date] || { foods: [], exercises: [] };
    } catch (error) {
      console.error('Erro ao obter dados diários:', error);
      return { foods: [], exercises: [] };
    }
  };

  // Atualizar informações do usuário
  const updateUserInfo = (userInfo: Partial<UserInfo>) => {
    try {
      setData(prev => ({
        ...prev,
        userInfo: { ...prev.userInfo, ...userInfo }
      }));
    } catch (error) {
      console.error('Erro ao atualizar informações do usuário:', error);
    }
  };

  // Atualizar metas de macronutrientes
  const updateMacroGoals = (goals: Partial<MacroGoals>) => {
    try {
      setData(prev => ({
        ...prev,
        macroGoals: { ...prev.macroGoals, ...goals }
      }));
    } catch (error) {
      console.error('Erro ao atualizar metas de macronutrientes:', error);
    }
  };

  // Buscar calorias por IA com cache estável e base expandida
  const searchCaloriesWithAI = async (foodName: string): Promise<number> => {
    try {
      const normalizedName = foodName.toLowerCase().trim();
      
      // Verificar cache primeiro
      if (caloriesCache.has(normalizedName)) {
        return caloriesCache.get(normalizedName)!;
      }

      // Base de dados local expandida
      const foodDatabase: Record<string, number> = {
        // Frutas
        'maçã': 52, 'banana': 89, 'laranja': 47, 'pêra': 57, 'uva': 62,
        'morango': 32, 'abacaxi': 50, 'manga': 60, 'kiwi': 61, 'melancia': 30,
        'melão': 34, 'pêssego': 39, 'ameixa': 46, 'cereja': 63, 'limão': 29,
        'coco': 354, 'abacate': 160, 'figo': 74, 'caqui': 70, 'goiaba': 68,
        
        // Vegetais
        'brócolis': 34, 'cenoura': 41, 'tomate': 18, 'alface': 15, 'pepino': 16,
        'cebola': 40, 'batata': 77, 'batata doce': 86, 'abobrinha': 17, 'berinjela': 25,
        'pimentão': 31, 'couve': 49, 'espinafre': 23, 'rúcula': 25, 'repolho': 25,
        'beterraba': 43, 'rabanete': 16, 'aipo': 14, 'aspargo': 20, 'couve-flor': 25,
        
        // Grãos e cereais
        'arroz': 130, 'arroz integral': 111, 'macarrão': 131, 'pão': 265, 'pão integral': 247,
        'aveia': 389, 'quinoa': 368, 'feijão': 127, 'lentilha': 116, 'grão de bico': 164,
        'milho': 86, 'trigo': 327, 'cevada': 354, 'centeio': 338, 'amaranto': 371,
        
        // Proteínas
        'peito de frango': 165, 'carne bovina': 250, 'peixe': 206, 'salmão': 208,
        'ovo': 155, 'clara de ovo': 52, 'tofu': 76, 'queijo': 113, 'iogurte': 59,
        'leite': 42, 'leite desnatado': 34, 'ricota': 174, 'atum': 144, 'sardinha': 208,
        'camarão': 99, 'frango': 239, 'peru': 135, 'porco': 242, 'cordeiro': 294,
        
        // Nozes e sementes
        'castanha': 656, 'amendoim': 567, 'amêndoa': 579, 'nozes': 654, 'pistache': 560,
        'semente de girassol': 584, 'semente de abóbora': 559, 'chia': 486, 'linhaça': 534,
        
        // Laticínios
        'queijo mussarela': 280, 'queijo cheddar': 403, 'queijo parmesão': 431,
        'iogurte grego': 59, 'leite integral': 61, 'manteiga': 717, 'creme de leite': 345,
        
        // Lanches e processados
        'pizza': 266, 'hambúrguer': 295, 'batata frita': 365, 'chocolate': 546,
        'sorvete': 207, 'biscoito': 502, 'bolo': 257, 'donut': 452, 'chips': 536,
        
        // Bebidas
        'refrigerante': 42, 'suco de laranja': 45, 'café': 2, 'chá': 1, 'água': 0,
        'cerveja': 43, 'vinho': 83, 'água de coco': 19, 'energético': 45, 'smoothie': 120,
        
        // Temperos e condimentos
        'azeite': 884, 'óleo': 884, 'vinagre': 19, 'sal': 0, 'açúcar': 387,
        'mel': 304, 'ketchup': 112, 'maionese': 680, 'mostarda': 66,
        
        // Pratos típicos brasileiros
        'feijoada': 150, 'brigadeiro': 150, 'pão de açúcar': 300, 'coxinha': 250,
        'pastel': 300, 'açaí': 58, 'tapioca': 98, 'farofa': 364, 'vatapá': 180
      };

      // Buscar correspondência exata ou parcial
      let calories = 0;
      
      // Busca exata
      if (foodDatabase[normalizedName]) {
        calories = foodDatabase[normalizedName];
      } else {
        // Busca parcial
        for (const [food, cals] of Object.entries(foodDatabase)) {
          if (normalizedName.includes(food) || food.includes(normalizedName)) {
            calories = cals;
            break;
          }
        }
      }

      // Se não encontrou, usar estimativa baseada no tipo de alimento
      if (calories === 0) {
        if (normalizedName.includes('fruta') || normalizedName.includes('suco natural')) {
          calories = 50;
        } else if (normalizedName.includes('vegetal') || normalizedName.includes('salada') || normalizedName.includes('verdura')) {
          calories = 25;
        } else if (normalizedName.includes('carne') || normalizedName.includes('frango') || normalizedName.includes('peixe') || normalizedName.includes('proteína')) {
          calories = 200;
        } else if (normalizedName.includes('arroz') || normalizedName.includes('massa') || normalizedName.includes('pão') || normalizedName.includes('carboidrato')) {
          calories = 150;
        } else if (normalizedName.includes('doce') || normalizedName.includes('chocolate') || normalizedName.includes('bolo')) {
          calories = 300;
        } else if (normalizedName.includes('bebida') || normalizedName.includes('suco')) {
          calories = 40;
        } else {
          calories = 100; // Valor padrão
        }
      }

      // Salvar no cache
      caloriesCache.set(normalizedName, calories);
      
      return calories;
    } catch (error) {
      console.error('Erro na busca de calorias:', error);
      return 100; // Valor padrão em caso de erro
    }
  };

  // Função para criar timestamp correto
  const createTimestamp = () => {
    return new Date().toISOString();
  };

  // Adicionar item de comida
  const addFood = (food: Omit<FoodItem, 'id' | 'timestamp'>) => {
    try {
      const newFood: FoodItem = {
        ...food,
        id: Date.now(),
        timestamp: createTimestamp()
      };

      setData(prev => ({
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [currentDate]: {
            ...getDailyData(currentDate),
            foods: [...getDailyData(currentDate).foods, newFood]
          }
        }
      }));
    } catch (error) {
      console.error('Erro ao adicionar comida:', error);
    }
  };

  // Adicionar comida a partir de produto escaneado
  const addFoodFromBarcode = (product: BarcodeProduct, quantity: number) => {
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

      addFood(food);
    } catch (error) {
      console.error('Erro ao adicionar comida do código de barras:', error);
    }
  };

  // Remover item de comida
  const removeFood = (date: string, foodId: number) => {
    try {
      setData(prev => ({
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...getDailyData(date),
            foods: getDailyData(date).foods.filter(f => f.id !== foodId)
          }
        }
      }));
    } catch (error) {
      console.error('Erro ao remover comida:', error);
    }
  };

  // Adicionar exercício
  const addExercise = (exercise: Omit<ExerciseEntry, 'id' | 'timestamp'>) => {
    try {
      const newExercise: ExerciseEntry = {
        ...exercise,
        id: Date.now(),
        timestamp: createTimestamp()
      };

      setData(prev => ({
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [currentDate]: {
            ...getDailyData(currentDate),
            exercises: [...getDailyData(currentDate).exercises, newExercise]
          }
        }
      }));
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
    }
  };

  // Remover exercício
  const removeExercise = (date: string, exerciseId: number) => {
    try {
      setData(prev => ({
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: {
            ...getDailyData(date),
            exercises: getDailyData(date).exercises.filter(e => e.id !== exerciseId)
          }
        }
      }));
    } catch (error) {
      console.error('Erro ao remover exercício:', error);
    }
  };

  // Adicionar entrada de peso
  const addWeightEntry = (weight: number) => {
    try {
      const newEntry: WeightEntry = {
        id: Date.now(),
        weight,
        date: currentDate
      };

      setData(prev => ({
        ...prev,
        weightHistory: [...(prev.weightHistory || []), newEntry],
        userInfo: { ...prev.userInfo, weight: weight.toString() }
      }));
    } catch (error) {
      console.error('Erro ao adicionar peso:', error);
    }
  };

  // Remover entrada de peso
  const removeWeightEntry = (id: number) => {
    try {
      setData(prev => ({
        ...prev,
        weightHistory: (prev.weightHistory || []).filter(entry => entry.id !== id)
      }));
    } catch (error) {
      console.error('Erro ao remover peso:', error);
    }
  };

  // Adicionar entrada de cintura
  const addWaistEntry = (waist: number) => {
    try {
      const newEntry: WaistEntry = {
        id: Date.now(),
        waist,
        date: currentDate
      };

      setData(prev => ({
        ...prev,
        waistHistory: [...(prev.waistHistory || []), newEntry],
        userInfo: { ...prev.userInfo, waist: waist.toString() }
      }));
    } catch (error) {
      console.error('Erro ao adicionar cintura:', error);
    }
  };

  // Remover entrada de cintura
  const removeWaistEntry = (id: number) => {
    try {
      setData(prev => ({
        ...prev,
        waistHistory: (prev.waistHistory || []).filter(entry => entry.id !== id)
      }));
    } catch (error) {
      console.error('Erro ao remover cintura:', error);
    }
  };

  // Adicionar receita
  const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      const newRecipe: Recipe = {
        ...recipe,
        id: Date.now(),
        createdAt: createTimestamp()
      };

      setData(prev => ({
        ...prev,
        recipes: [...(prev.recipes || []), newRecipe]
      }));
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
    }
  };

  // Remover receita
  const removeRecipe = (id: number) => {
    try {
      setData(prev => ({
        ...prev,
        recipes: (prev.recipes || []).filter(recipe => recipe.id !== id)
      }));
    } catch (error) {
      console.error('Erro ao remover receita:', error);
    }
  };

  // Adicionar comida a partir de receita
  const addFoodFromRecipe = (recipe: Recipe, servings: number) => {
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

      addFood(food);
    } catch (error) {
      console.error('Erro ao adicionar comida da receita:', error);
    }
  };

  // Adicionar alerta
  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    try {
      const newAlert: Alert = {
        ...alert,
        id: Date.now(),
        timestamp: createTimestamp(),
        read: false
      };

      setData(prev => ({
        ...prev,
        alerts: [...(prev.alerts || []), newAlert]
      }));
    } catch (error) {
      console.error('Erro ao adicionar alerta:', error);
    }
  };

  // Marcar alerta como lido
  const markAlertAsRead = (id: number) => {
    try {
      setData(prev => ({
        ...prev,
        alerts: (prev.alerts || []).map(alert => 
          alert.id === id ? { ...alert, read: true } : alert
        )
      }));
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  // Resetar todos os dados
  const resetData = () => {
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
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
    }
  };

  return {
    data: safeData,
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
    resetData
  };
}; 

export default useCalorieTracker;