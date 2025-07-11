export interface UserInfo {
  age: string;
  gender: 'male' | 'female' | '';
  height: string;
  weight: string;
  activityLevel: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extraActive';
  goalWeight?: string;
  weeklyGoal?: string;
  waist?: string;
  bodyFat?: string;
  leanMass?: string;
  bodyType?: 'ectomorfo' | 'mesomorfo' | 'endomorfo' | '';
}

export interface MacroGoals {
  calories: number;
  protein: number; // gramas
  carbs: number; // gramas
  fat: number; // gramas
  fiber: number; // gramas
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  quantity: number;
  unit: string;
  timestamp: string;
  nutrition?: NutritionInfo;
  barcode?: string;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  totalNutrition: NutritionInfo;
  prepTime: number; // minutos
  cookTime: number; // minutos
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  nutrition: NutritionInfo;
}

export interface ExerciseEntry {
  id: number;
  name: string;
  calories: number;
  timestamp: string;
}

export interface WeightEntry {
  id: number;
  weight: number;
  date: string;
}

export interface WaistEntry {
  id: number;
  waist: number;
  date: string;
}

export interface DailyData {
  foods: FoodItem[];
  exercises: ExerciseEntry[];
}

export interface TrackerData {
  userInfo: UserInfo;
  dailyData: Record<string, DailyData>;
  weightHistory: WeightEntry[];
  waistHistory: WaistEntry[];
  macroGoals: MacroGoals;
  recipes: Recipe[];
  alerts: Alert[];
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  nutrition: NutritionInfo;
  servingSize: number;
  servingUnit: string;
}

export interface Alert {
  id: number;
  type: 'goal' | 'warning' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}