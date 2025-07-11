// ARQUIVO: src/hooks/useCalorieTrackerFirebase.ts (VERSÃO FINAL E REAL)

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
    const { saveDocument, getDocument, subscribeToCollection } = useFirestore(user);

    // O estado inicial já contém a estrutura de dados para evitar erros de 'null'
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

    // Efeito para carregar os dados iniciais do perfil.
    // Depende de 'user.uid' para não causar loops.
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Busca o perfil e as metas em paralelo para mais velocidade
                const [userProfile, macroGoalsData] = await Promise.all([
                    getDocument('profile', 'info'),
                    getDocument('profile', 'macroGoals')
                ]);
                
                // Atualiza o estado de uma só vez com os dados encontrados
                setData(prev => ({
                    ...prev,
                    userInfo: { ...defaultUserInfo, ...(userProfile || {}) },
                    macroGoals: { ...defaultMacroGoals, ...(macroGoalsData || {}) }
                }));

            } catch (e) {
                console.error("Erro ao carregar dados do usuário:", e);
                setError("Falha ao carregar o perfil.");
            } finally {
                // Garante que o loading termine, mesmo em caso de erro.
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user?.uid, getDocument]);

    // O resto do seu hook com os cálculos e funções...
    const calculations = useMemo(() => {
        // ... (código dos cálculos)
    }, [data.userInfo]);

    const updateUserInfo = useCallback((userInfoUpdate: Partial<UserInfo>) => {
        // ... (código do updateUserInfo)
    }, [saveDocument]);

    const getDailyData = useCallback((date: string): DailyData => {
        return data.dailyData[date] || { foods: [], exercises: [] };
    }, [data.dailyData]);


    return { data, loading, error, calculations, updateUserInfo, getDailyData /* ... e suas outras funções */ };
}
