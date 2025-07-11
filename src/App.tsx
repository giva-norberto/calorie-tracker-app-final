import React, { useState } from 'react';
import useCalorieTrackerFirebase from './hooks/useCalorieTrackerFirebase';
import { useAuth } from './hooks/useAuth';
import AuthWrapper from './components/AuthWrapper';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import PersonalInfo from './components/PersonalInfo';
// ... importe outros componentes que você usa

function App() {
    const [activeSection, setActiveSection] = useState('summary');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const { data, calculations, loading, error, updateUserInfo, getDailyData } = useCalorieTrackerFirebase();

    // GUARDA DE SEGURANÇA: Previne a "tela branca" ao esperar os dados carregarem.
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100">Carregando...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen bg-red-100 text-red-700">Erro: {error}</div>;
    }

    const renderContent = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const currentDayData = getDailyData(currentDate);

        switch (activeSection) {
            case 'personalInfo':
                return <PersonalInfo userInfo={data.userInfo} updateUserInfo={updateUserInfo} calculations={calculations} />;
            case 'summary':
            default:
                return <Dashboard dailyData={currentDayData} tdee={calculations.tdee} currentDate={currentDate} alerts={data.alerts} />;
        }
    };

    return (
        <AuthWrapper>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title={activeSection} onMenuClick={() => setSidebarOpen(true)} user={{ name: user?.displayName || 'Usuário' }} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </AuthWrapper>
    );
}

export default App;
