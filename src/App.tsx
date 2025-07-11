import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User, AlertCircle } from 'lucide-react';
import ToastContainer from './components/ui/ToastContainer';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/Dashboard';
import PersonalInfo from './components/PersonalInfo';
import MacroGoals from './components/MacroGoals';
import AddFood from './components/AddFood';
import BarcodeScanner from './components/BarcodeScanner';
import Recipes from './components/Recipes';
import AddExercise from './components/AddExercise';
import WeightHistory from './components/WeightHistory';
import EvolutionDashboard from './components/EvolutionDashboard';
import History from './components/History';
import Export from './components/Export';
import AuthWrapper from './components/AuthWrapper';
import { useAuth } from './hooks/useAuth';
import useCalorieTrackerFirebase from './hooks/useCalorieTrackerFirebase';

function App() {
  const [activeSection, setActiveSection] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { user, logout } = useAuth();
  
  const {
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
    loading,
    error
  } = useCalorieTrackerFirebase();

  // Gerenciar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const currentDayData = getDailyData(currentDate);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'summary':
        return (
          <Dashboard
            dailyData={currentDayData}
            tdee={calculations.tdee}
            currentDate={currentDate}
            alerts={data.alerts.filter(alert => !alert.read)}
          />
        );
      case 'personalInfo':
        return (
          <PersonalInfo
            userInfo={data.userInfo}
            updateUserInfo={updateUserInfo}
            calculations={calculations}
          />
        );
      case 'macroGoals':
        return (
          <MacroGoals
            macroGoals={data.macroGoals}
            updateMacroGoals={updateMacroGoals}
            dailyData={currentDayData}
            currentDate={currentDate}
          />
        );
      case 'addFood':
        return (
          <AddFood
            dailyData={currentDayData}
            addFood={addFood}
            removeFood={removeFood}
            currentDate={currentDate}
            searchCaloriesWithAI={searchCaloriesWithAI}
          />
        );
      case 'barcodeScanner':
        setShowBarcodeScanner(true);
        setActiveSection('addFood');
        return null;
      case 'recipes':
        return (
          <Recipes
            recipes={data.recipes}
            addRecipe={addRecipe}
            removeRecipe={removeRecipe}
            addFoodFromRecipe={addFoodFromRecipe}
          />
        );
      case 'addExercise':
        return (
          <AddExercise
            dailyData={currentDayData}
            addExercise={addExercise}
            removeExercise={removeExercise}
            currentDate={currentDate}
          />
        );
      case 'weightHistory':
        return (
          <WeightHistory
            weightHistory={data.weightHistory}
            addWeightEntry={addWeightEntry}
            removeWeightEntry={removeWeightEntry}
            currentWeight={data.userInfo.weight}
            waistHistory={data.waistHistory}
            addWaistEntry={addWaistEntry}
            removeWaistEntry={removeWaistEntry}
          />
        );
      case 'evolution':
        return (
          <EvolutionDashboard
            weightHistory={data.weightHistory}
            waistHistory={data.waistHistory}
            userInfo={data.userInfo}
            tdeeHistory={[]}
          />
        );
      case 'history':
        return (
          <History
            viewedDate={viewedDate}
            setViewedDate={setViewedDate}
            getDailyData={getDailyData}
            removeFood={removeFood}
            removeExercise={removeExercise}
            tdee={calculations.tdee}
          />
        );
      case 'export':
        return (
          <Export
            data={data}
            resetData={resetData}
          />
        );
      default:
        return (
          <Dashboard 
            dailyData={currentDayData} 
            tdee={calculations.tdee} 
            currentDate={currentDate}
            alerts={data.alerts.filter(alert => !alert.read)}
          />
        );
    }
  };

  const getSectionTitle = () => {
    const titles = {
      summary: 'Painel Principal',
      personalInfo: 'Perfil Pessoal',
      macroGoals: 'Metas Nutricionais',
      addFood: 'Adicionar Comida',
      recipes: 'Receitas',
      addExercise: 'Adicionar Exercício',
      weightHistory: 'Histórico de Peso',
      evolution: 'Dashboard de Evolução',
      history: 'Histórico',
      export: 'Exportar Dados'
    };
    return titles[activeSection as keyof typeof titles] || 'CalorieTracker';
  };

  return (
    <AuthWrapper>
      <ToastContainer>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex h-screen">
            <Sidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header
                title={getSectionTitle()}
                onMenuClick={() => setSidebarOpen(true)}
                theme={theme}
                onThemeToggle={toggleTheme}
                user={{
                  name: user?.displayName || 'Usuário',
                  email: user?.email || '',
                  avatar: user?.photoURL || undefined
                }}
              />
              
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                  {renderContent()}
                </div>
              </main>
            </div>
          </div>

          {/* Scanner de Código de Barras */}
          {showBarcodeScanner && (
            <BarcodeScanner
              onProductFound={(product) => {
                const quantityInput = prompt('Quantas unidades você consumiu?', '1');
                if (quantityInput && parseFloat(quantityInput) > 0) {
                  const quantity = parseFloat(quantityInput);
                  addFoodFromBarcode(product, quantity);
                  
                  addAlert({
                    type: 'achievement',
                    title: 'Produto Adicionado!',
                    message: `${product.name} foi adicionado ao seu diário com sucesso.`,
                    priority: 'medium'
                  });
                }
                setShowBarcodeScanner(false);
              }}
              onClose={() => setShowBarcodeScanner(false)}
            />
          )}
        </div>
      </ToastContainer>
    </AuthWrapper>
  );
}

export default App;