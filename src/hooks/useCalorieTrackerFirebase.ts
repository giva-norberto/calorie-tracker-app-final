// Arquivo: src/hooks/useCalorieTrackerFirebase.ts (VERSÃO FINAL ANTI-LOOP)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { UserInfo, TrackerData, DailyData, MacroGoals } from '../types';

// Valores Padrão para um estado inicial seguro
const defaultUserInfo: UserInfo = {
    age: '', gender: 'male', height: '', weight: '', activityLevel: 'sedentary',
    goalWeight: '', weeklyGoal: '0.5', bodyFat: '', leanMass: '', bodyType: '', waist: ''
};
const defaultMacroGoals: MacroGoals = { calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 25 };

export default function useCalorieTrackerFirebase() {
    const { user } = useAuth();
    const { saveDocument, getDocument, subscribeToCollection, loading: firestoreLoading, error: firestoreError } = useFirestore(user);

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

    // CORREÇÃO NO useEffect: Usar uma dependência estável como `user.uid`
    // O objeto `user` pode mudar a cada renderização, mas o `user.uid` é uma string estável.
    useEffect(() => {
        // Se não há ID de usuário, não fazemos nada e paramos de carregar.
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            try {
                const userProfile = await getDocument('profile', 'info');
                if (userProfile) {
                    // Atualiza os dados do usuário, mantendo os padrões para campos não preenchidos
                    setData(prev => ({ ...prev, userInfo: { ...defaultUserInfo, ...userProfile } }));
                }
            } catch (e) {
                console.error("Erro ao carregar perfil:", e);
                setError("Falha ao carregar o perfil.");
            } finally {
                // Para de carregar APENAS depois de buscar os dados essenciais.
                setLoading(false);
            }
        };

        loadInitialData();
        // A dependência agora é user.uid, que é estável e não causa loops.
    }, [user?.uid, getDocument]);


    // Os cálculos com useMemo estão corretos.
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
        const tdee = bmr * activityFactors[activityLevel as keyof typeof activityFactors];
        return { bmi: Math.round(bmi * 10) / 10, bmr: Math.round(bmr), tdee: Math.round(tdee), bmiCategory };
    }, [data.userInfo]);


    // A função de atualização com useCallback está correta.
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
    
    // As outras funções também devem ser estabilizadas se forem usadas como dependências ou props
    const getDailyData = useCallback((date: string): DailyData => {
        return data.dailyData[date] || { foods: [], exercises: [] };
    }, [data.dailyData]);


    return {
        data,
        calculations,
        loading: loading || firestoreLoading,
        error: error || firestoreError,
        updateUserInfo,
        getDailyData,
        // ...retorne todas as outras funções que seu App.tsx precisa
    };
}
