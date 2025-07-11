import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { UserInfo, TrackerData, DailyData, MacroGoals, Alert, Recipe, WeightEntry, WaistEntry } from '../types';

// Define um estado inicial seguro para evitar erros de 'undefined'
const defaultUserInfo: UserInfo = {
    age: '', gender: 'male', height: '', weight: '', activityLevel: 'sedentary',
    goalWeight: '', weeklyGoal: '0.5', bodyFat: '', leanMass: '', bodyType: '', waist: ''
};
const defaultData: TrackerData = {
    userInfo: defaultUserInfo,
    dailyData: {},
    weightHistory: [],
    waistHistory: [],
    macroGoals: { calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 25 },
    recipes: [],
    alerts: []
};

export default function useCalorieTrackerFirebase() {
    const { user } = useAuth();
    const { saveDocument, getDocument, subscribeToCollection } = useFirestore(user);

    const [data, setData] = useState<TrackerData>(defaultData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carrega os dados essenciais do perfil uma única vez
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const loadInitialProfile = async () => {
            setLoading(true);
            try {
                const userProfile = await getDocument('profile', 'info');
                if (userProfile) {
                    setData(prev => ({ ...prev, userInfo: { ...defaultUserInfo, ...userProfile } }));
                }
            } catch (e) {
                console.error("Erro ao carregar perfil:", e);
                setError("Falha ao carregar o perfil.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialProfile();
    }, [user?.uid, getDocument]);

    // Otimiza os cálculos para rodar apenas quando necessário
    const calculations = useMemo(() => {
        const { age, gender, height, weight, activityLevel } = data.userInfo;
        const ageNum = parseInt(age), heightNum = parseFloat(height), weightNum = parseFloat(weight);
        if (!ageNum || !heightNum || !weightNum || !gender) return { bmi: 0, bmr: 0, tdee: 0, bmiCategory: 'Dados insuficientes' };
        const heightM = heightNum / 100;
        const bmi = parseFloat((weightNum / (heightM * heightM)).toFixed(1));
        let bmiCategory = 'Normal';
        if (bmi < 18.5) bmiCategory = 'Abaixo do peso'; else if (bmi >= 25) bmiCategory = 'Sobrepeso';
        let bmr = (gender === 'male')
            ? 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum)
            : 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
        const activityFactors = { sedentary: 1.2, lightlyActive: 1.375, moderatelyActive: 1.55, veryActive: 1.725, extraActive: 1.9 };
        const tdee = bmr * (activityFactors[activityLevel as keyof typeof activityFactors] || 1.2);
        return { bmi: Math.round(bmi * 10) / 10, bmr: Math.round(bmr), tdee: Math.round(tdee), bmiCategory };
    }, [data.userInfo]);
    
    // Estabiliza a função de update para não causar re-renderizações desnecessárias
    const updateUserInfo = useCallback((userInfoUpdate: Partial<UserInfo>) => {
        setData(prev => {
            const updatedInfo = { ...prev.userInfo, ...userInfoUpdate };
            saveDocument('profile', updatedInfo, 'info').catch(err => {
                console.error("Falha ao salvar perfil:", err);
                setError("Erro ao salvar o perfil.");
            });
            return { ...prev, userInfo: updatedInfo };
        });
    }, [saveDocument]);

    const getDailyData = useCallback((date: string): DailyData => {
        return data.dailyData[date] || { foods: [], exercises: [] };
    }, [data.dailyData]);

    // Retorna todos os dados e funções que o App precisa
    return { data, calculations, loading, error, updateUserInfo, getDailyData };
}
