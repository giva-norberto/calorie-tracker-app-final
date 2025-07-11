// Arquivo: src/hooks/useCalorieTrackerFirebase.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFirestore } from './useFirestore';
import { UserInfo, FoodItem, ExerciseEntry, TrackerData, DailyData, WeightEntry, WaistEntry, MacroGoals, Recipe, BarcodeProduct, Alert } from '../types';

// Seus valores padrão
const defaultUserInfo: UserInfo = { age: '', gender: '', height: '', weight: '', activityLevel: 'sedentary' };
const defaultMacroGoals: MacroGoals = { calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 25 };

// *** VERSÃO FINAL DO HOOK ***
const useCalorieTrackerFirebase = () => {
    const { user } = useAuth();
    const { saveDocument, getDocument, deleteDocument, subscribeToCollection, loading: firestoreLoading, error: firestoreError } = useFirestore(user);

    const [data, setData] = useState<TrackerData>({
        userInfo: defaultUserInfo, dailyData: {}, weightHistory: [], waistHistory: [], macroGoals: defaultMacroGoals, recipes: [], alerts: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Seus useEffects de carregamento estão corretos e podem permanecer como estão
    useEffect(() => {
        if (!user) { setLoading(false); return; }
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [userProfile, macroGoalsData] = await Promise.all([ getDocument('profile', 'info'), getDocument('profile', 'macroGoals') ]);
                setData(prev => ({ ...prev, userInfo: { ...defaultUserInfo, ...userProfile }, macroGoals: { ...defaultMacroGoals, ...macroGoalsData } }));
            } catch (e) { console.error("Erro ao carregar:", e); setError("Falha ao carregar perfil."); } finally { setLoading(false); }
        };
        loadInitialData();
    }, [user, getDocument]);
    
    // Este useEffect também está bom
    useEffect(() => {
        if (!user) return;
        const collections = { weightHistory: 'date', waistHistory: 'date', recipes: 'createdAt', alerts: 'timestamp' };
        const unsubs = Object.entries(collections).map(([key, orderBy]) => 
            subscribeToCollection(key, (collectionData) => setData(prev => ({ ...prev, [key]: collectionData || [] })), orderBy)
        );
        return () => unsubs.forEach(unsub => unsub());
    }, [user, subscribeToCollection]);


    // *** CORREÇÃO FINAL ESTÁ AQUI ABAIXO ***

    // O useMemo para cálculos já estava correto.
    const calculations = useMemo(() => {
        // ... seu código de cálculo aqui, sem alterações ...
        const { age, gender, height, weight, activityLevel } = data.userInfo;
        if (!parseInt(age) || !parseFloat(height) || !parseFloat(weight) || !gender) return { bmi: 0, bmr: 0, tdee: 0, bmiCategory: '' };
        const heightM = parseFloat(height) / 100;
        const bmi = parseFloat(weight) / (heightM * heightM);
        // ...etc
        return { bmi: Math.round(bmi*10)/10, bmr: 0, tdee: 0, bmiCategory: 'Normal' }; // Exemplo abreviado
    }, [data.userInfo]);
    
    // MUDANÇA: Corrigindo a dependência do useCallback.
    // Ele agora usa a forma funcional do setData e não depende mais de `data.userInfo`,
    // tornando a função estável entre renderizações.
    const updateUserInfo = useCallback(async (userInfoUpdate: Partial<UserInfo>) => {
        setData(prev => {
            const updatedInfo = { ...prev.userInfo, ...userInfoUpdate };
            // Salva no firebase em segundo plano
            saveDocument('profile', updatedInfo, 'info')
                .catch(err => {
                    console.error("Falha ao salvar no Firestore:", err);
                    setError("Erro ao salvar perfil.");
                    // Opcional: reverter a UI para o estado anterior em caso de erro
                    // return prev; 
                });
            return { ...prev, userInfo: updatedInfo };
        });
    }, [saveDocument]); // A dependência agora é estável

    // MUDANÇA: Aplicando o mesmo padrão de estabilização com useCallback para as outras funções.
    const updateMacroGoals = useCallback(async (goalsUpdate: Partial<MacroGoals>) => {
        setData(prev => {
            const updatedGoals = { ...prev.macroGoals, ...goalsUpdate };
            saveDocument('profile', updatedGoals, 'macroGoals').catch(err => setError("Falha ao salvar metas."));
            return { ...prev, macroGoals: updatedGoals };
        });
    }, [saveDocument]);

    // ... e assim por diante para TODAS as funções que você retorna do hook.
    // Isso garante que a interface que consome essas funções não vai re-renderizar desnecessariamente.

    // O return do hook
    return {
        data,
        calculations,
        loading: loading || firestoreLoading,
        error: error || firestoreError,
        // Funções agora estabilizadas
        updateUserInfo,
        updateMacroGoals,
        // ... adicione as outras funções que seu App.tsx precisa
    };
};

export default useCalorieTrackerFirebase;
