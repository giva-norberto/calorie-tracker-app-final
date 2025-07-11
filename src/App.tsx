import React, { useState, useEffect, useCallback } from 'react';
import PersonalInfo from './components/PersonalInfo';
import Dashboard from './components/Dashboard';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AuthWrapper from './components/AuthWrapper';
import { useAuth } from './hooks/useAuth';
import useCalorieTrackerFirebase from './hooks/useCalorieTrackerFirebase';
// ... outros imports que você usa

function App() {
    const [activeSection, setActiveSection] = useState('summary');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const { data, calculations, loading, error, updateUserInfo, getDailyData } = useCalorieTrackerFirebase();

    // GUARDA DE SEGURANÇA: Mostra "Carregando..." até que o hook termine o trabalho inicial.
    // Isso previne a "tela branca".
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>;
    }
    
    // Mostra uma tela de erro se a busca de dados falhar.
    if (error) {
        return <div className="flex justify-center items-center h-screen">Erro: {error}</div>;
    }

    const renderContent = () => {
        const currentDayData = getDailyData(new Date().toISOString().split('T')[0]);
        switch (activeSection) {
            case 'personalInfo':
                return <PersonalInfo userInfo={data.userInfo} updateUserInfo={updateUserInfo} calculations={calculations} />;
            case 'summary':
            default:
                return <Dashboard dailyData={currentDayData} tdee={calculations.tdee} currentDate={new Date().toISOString().split('T')[0]} alerts={data.alerts} />;
        }
    };

    return (
        <AuthWrapper>
            <div className="flex h-screen bg-gray-50">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title={activeSection} onMenuClick={() => setSidebarOpen(true)} user={{ name: user?.displayName || 'Usuário' }} />
                    <main className="flex-1 overflow-y-auto p-8">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </AuthWrapper>
    );
}

export default App;
