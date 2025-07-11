import React from 'react';
import { DailyData, Alert } from '../types';
import { TriangleAlert } from 'lucide-react';

interface DashboardProps {
    dailyData: DailyData | null | undefined;
    tdee: number;
    currentDate: string;
    alerts: Alert[];
}

const Dashboard: React.FC<DashboardProps> = ({ dailyData, tdee, currentDate, alerts }) => {
    // Guarda de segurança para o caso de dailyData ser nulo
    if (!dailyData) {
        return <div className="p-4 rounded-lg bg-gray-100 text-center">Carregando dados do dia...</div>;
    }

    // Cálculos seguros usando optional chaining (?.) e nullish coalescing (??)
    const consumedCalories = dailyData.foods?.reduce((acc, food) => acc + (food.calories * food.quantity), 0) ?? 0;
    const burnedCalories = dailyData.exercises?.reduce((acc, exercise) => acc + exercise.caloriesBurned, 0) ?? 0;
    const remainingCalories = tdee - (consumedCalories - burnedCalories);
    const activeAlerts = alerts?.filter(alert => !alert.read) ?? [];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Painel Principal</h1>
                <p className="text-gray-600">Resumo do seu dia: {new Date(currentDate + 'T00:00:00').toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                    <h3 className="font-semibold text-lg text-gray-700">Calorias Restantes</h3>
                    <p className="text-4xl font-bold text-green-600">{Math.round(remainingCalories)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                    <h3 className="font-semibold text-lg text-gray-700">Consumidas</h3>
                    <p className="text-4xl font-bold text-blue-600">{Math.round(consumedCalories)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                    <h3 className="font-semibold text-lg text-gray-700">Queimadas</h3>
                    <p className="text-4xl font-bold text-orange-600">{Math.round(burnedCalories)}</p>
                </div>
            </div>

            {activeAlerts.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <TriangleAlert className="w-6 h-6 mr-3" />
                        <div>
                            <h4 className="font-bold">Alertas Pendentes</h4>
                            {activeAlerts.map(alert => <p key={alert.id} className="text-sm">{alert.message}</p>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
