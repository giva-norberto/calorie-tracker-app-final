import React from 'react';
import { 
  Home, 
  User, 
  Plus, 
  Apple, 
  History, 
  Download, 
  Scale,
  Target,
  ChefHat,
  Camera,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: 'summary', label: 'Painel', icon: Home, color: 'from-blue-500 to-indigo-500' },
  { id: 'personalInfo', label: 'Perfil', icon: User, color: 'from-purple-500 to-pink-500' },
  { id: 'macroGoals', label: 'Metas Nutricionais', icon: Target, color: 'from-purple-500 to-indigo-500' },
  { id: 'addFood', label: 'Adicionar Comida', icon: Apple, color: 'from-emerald-500 to-green-500' },
  { id: 'barcodeScanner', label: 'Scanner Código', icon: Camera, color: 'from-blue-500 to-purple-500' },
  { id: 'recipes', label: 'Receitas', icon: ChefHat, color: 'from-orange-500 to-red-500' },
  { id: 'addExercise', label: 'Adicionar Exercício', icon: Plus, color: 'from-orange-500 to-red-500' },
  { id: 'weightHistory', label: 'Histórico de Peso', icon: Scale, color: 'from-cyan-500 to-blue-500' },
  { id: 'evolution', label: 'Dashboard Evolução', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { id: 'history', label: 'Histórico', icon: History, color: 'from-violet-500 to-purple-500' },
  { id: 'export', label: 'Exportar', icon: Download, color: 'from-gray-500 to-gray-600' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen 
}) => {
  const handleMenuClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
        text-white z-50 transform transition-transform duration-300 ease-in-out
        lg:transform-none shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  CalorieTracker
                </h1>
                <p className="text-gray-400 text-sm">Vida Saudável</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-4">
              {menuItems.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => handleMenuClick(id)}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${activeSection === id 
                      ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105` 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${activeSection === id 
                      ? 'bg-white/20' 
                      : 'bg-gray-600 group-hover:bg-gray-500'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">{label}</span>
                  {activeSection === id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700">
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-gray-300 font-medium">
                  Transforme sua saúde
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Um dia de cada vez
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;