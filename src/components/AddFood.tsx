import React, { useState } from 'react';
import { Apple, Plus, Search, Trash2, Clock, Zap, Sparkles, Star, ChefHat, Coffee, Utensils, Droplets } from 'lucide-react';
import { FoodItem, DailyData } from '../types';

interface AddFoodProps {
  dailyData: DailyData;
  addFood: (food: Omit<FoodItem, 'id' | 'timestamp'>) => void;
  removeFood: (date: string, foodId: number) => void;
  currentDate: string;
  searchCaloriesWithAI: (foodName: string) => Promise<number>;
}

const AddFood: React.FC<AddFoodProps> = ({ 
  dailyData, 
  addFood, 
  removeFood, 
  currentDate,
  searchCaloriesWithAI
}) => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [quantity, setQuantity] = useState(''); // Sempre vazio inicialmente
  const [unit, setUnit] = useState('g');
  const [searchingCalories, setSearchingCalories] = useState(false);

  const totalCalories = dailyData.foods.reduce((sum, food) => sum + (food.calories * food.quantity), 0);
  const currentFoodTotalCalories = (parseInt(calories) || 0) * (parseInt(quantity) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim() || !calories || !quantity) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    addFood({
      name: foodName.trim(),
      calories: parseInt(calories),
      quantity: parseInt(quantity),
      unit: unit.trim()
    });

    // Resetar formulário completamente
    setFoodName('');
    setCalories('');
    setQuantity(''); // Sempre limpar quantidade
    setUnit('g');
  };

  // Buscar calorias com IA estabilizada
  const searchCalories = async () => {
    if (!foodName.trim()) {
      alert('Por favor, digite o nome da comida primeiro');
      return;
    }

    setSearchingCalories(true);
    
    try {
      const foundCalories = await searchCaloriesWithAI(foodName);
      setCalories(foundCalories.toString());
      // NÃO definir quantidade automaticamente - deixar vazio
    } catch (error) {
      console.error('Erro ao buscar calorias:', error);
      alert('Erro ao buscar calorias. Tente novamente.');
    } finally {
      setSearchingCalories(false);
    }
  };

  // Alimentos comuns categorizados e expandidos (dobrar quantidade)
  const commonFoods = {
    '☕ Café da Manhã': [
      { name: 'Pão Francês', calories: 150, unit: 'unidade' },
      { name: 'Pão de Forma', calories: 80, unit: 'fatia' },
      { name: 'Café com Leite', calories: 80, unit: 'xícara' },
      { name: 'Café Preto', calories: 2, unit: 'xícara' },
      { name: 'Banana', calories: 89, unit: 'unidade' },
      { name: 'Maçã', calories: 52, unit: 'unidade' },
      { name: 'Aveia', calories: 68, unit: 'colher' },
      { name: 'Granola', calories: 471, unit: 'g' },
      { name: 'Ovo Mexido', calories: 155, unit: 'unidade' },
      { name: 'Ovo Cozido', calories: 78, unit: 'unidade' },
      { name: 'Iogurte Natural', calories: 59, unit: 'g' },
      { name: 'Iogurte Grego', calories: 59, unit: 'g' },
      { name: 'Leite Integral', calories: 61, unit: 'copo' },
      { name: 'Leite Desnatado', calories: 34, unit: 'copo' },
      { name: 'Manteiga', calories: 717, unit: 'g' },
      { name: 'Margarina', calories: 533, unit: 'g' },
      { name: 'Mel', calories: 304, unit: 'colher' },
      { name: 'Geleia', calories: 278, unit: 'colher' },
    ],
    '🍽️ Almoço/Jantar': [
      { name: 'Arroz Branco', calories: 130, unit: 'g' },
      { name: 'Arroz Integral', calories: 111, unit: 'g' },
      { name: 'Feijão Preto', calories: 127, unit: 'g' },
      { name: 'Feijão Carioca', calories: 76, unit: 'g' },
      { name: 'Peito de Frango', calories: 165, unit: 'g' },
      { name: 'Carne Bovina', calories: 250, unit: 'g' },
      { name: 'Peixe Grelhado', calories: 206, unit: 'g' },
      { name: 'Salmão', calories: 208, unit: 'g' },
      { name: 'Salada Verde', calories: 20, unit: 'g' },
      { name: 'Tomate', calories: 18, unit: 'g' },
      { name: 'Batata Cozida', calories: 77, unit: 'g' },
      { name: 'Batata Doce', calories: 86, unit: 'g' },
      { name: 'Macarrão', calories: 131, unit: 'g' },
      { name: 'Lasanha', calories: 135, unit: 'g' },
      { name: 'Pizza', calories: 266, unit: 'fatia' },
      { name: 'Hambúrguer', calories: 295, unit: 'unidade' },
      { name: 'Batata Frita', calories: 365, unit: 'g' },
      { name: 'Purê de Batata', calories: 83, unit: 'g' },
    ],
    '🥗 Vegetais & Saladas': [
      { name: 'Brócolis', calories: 34, unit: 'g' },
      { name: 'Cenoura', calories: 41, unit: 'g' },
      { name: 'Pepino', calories: 16, unit: 'g' },
      { name: 'Alface', calories: 15, unit: 'g' },
      { name: 'Rúcula', calories: 25, unit: 'g' },
      { name: 'Espinafre', calories: 23, unit: 'g' },
      { name: 'Couve', calories: 49, unit: 'g' },
      { name: 'Repolho', calories: 25, unit: 'g' },
      { name: 'Pimentão', calories: 31, unit: 'g' },
      { name: 'Cebola', calories: 40, unit: 'g' },
      { name: 'Abobrinha', calories: 17, unit: 'g' },
      { name: 'Berinjela', calories: 25, unit: 'g' },
      { name: 'Beterraba', calories: 43, unit: 'g' },
      { name: 'Couve-flor', calories: 25, unit: 'g' },
      { name: 'Aspargo', calories: 20, unit: 'g' },
      { name: 'Aipo', calories: 14, unit: 'g' },
    ],
    '🍎 Frutas & Lanches': [
      { name: 'Laranja', calories: 47, unit: 'unidade' },
      { name: 'Pêra', calories: 57, unit: 'unidade' },
      { name: 'Uva', calories: 62, unit: 'g' },
      { name: 'Morango', calories: 32, unit: 'g' },
      { name: 'Abacaxi', calories: 50, unit: 'g' },
      { name: 'Manga', calories: 60, unit: 'g' },
      { name: 'Kiwi', calories: 61, unit: 'unidade' },
      { name: 'Melancia', calories: 30, unit: 'g' },
      { name: 'Melão', calories: 34, unit: 'g' },
      { name: 'Castanha do Pará', calories: 656, unit: 'g' },
      { name: 'Amendoim', calories: 567, unit: 'g' },
      { name: 'Amêndoa', calories: 579, unit: 'g' },
      { name: 'Nozes', calories: 654, unit: 'g' },
      { name: 'Biscoito Integral', calories: 45, unit: 'unidade' },
      { name: 'Barra de Cereal', calories: 120, unit: 'unidade' },
      { name: 'Queijo Cottage', calories: 98, unit: 'g' },
    ],
    '🥤 Bebidas': [
      { name: 'Água', calories: 0, unit: 'copo' },
      { name: 'Suco de Laranja', calories: 45, unit: 'copo' },
      { name: 'Suco de Maçã', calories: 46, unit: 'copo' },
      { name: 'Chá Verde', calories: 1, unit: 'xícara' },
      { name: 'Chá Preto', calories: 2, unit: 'xícara' },
      { name: 'Refrigerante', calories: 42, unit: 'copo' },
      { name: 'Refrigerante Diet', calories: 1, unit: 'copo' },
      { name: 'Água de Coco', calories: 19, unit: 'copo' },
      { name: 'Energético', calories: 45, unit: 'lata' },
      { name: 'Smoothie Verde', calories: 120, unit: 'copo' },
      { name: 'Cerveja', calories: 43, unit: 'copo' },
      { name: 'Vinho Tinto', calories: 83, unit: 'taça' },
      { name: 'Whisky', calories: 250, unit: 'dose' },
      { name: 'Vodka', calories: 231, unit: 'dose' },
    ],
    '🍰 Doces & Sobremesas': [
      { name: 'Chocolate', calories: 546, unit: 'g' },
      { name: 'Sorvete', calories: 207, unit: 'g' },
      { name: 'Bolo de Chocolate', calories: 257, unit: 'fatia' },
      { name: 'Brigadeiro', calories: 150, unit: 'unidade' },
      { name: 'Pudim', calories: 156, unit: 'fatia' },
      { name: 'Torta', calories: 300, unit: 'fatia' },
      { name: 'Donut', calories: 452, unit: 'unidade' },
      { name: 'Cookies', calories: 502, unit: 'g' },
      { name: 'Açaí', calories: 58, unit: 'g' },
      { name: 'Picolé', calories: 80, unit: 'unidade' },
    ]
  };

  const selectCommonFood = (food: { name: string; calories: number; unit: string }) => {
    setFoodName(food.name);
    setCalories(food.calories.toString());
    setUnit(food.unit);
    // NÃO definir quantidade - deixar para o usuário preencher
    setQuantity('');
  };

  // Formatar data corretamente
  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-blue-50">
      <div className="space-y-8 pb-20 pt-4">
        {/* Cabeçalho Melhorado */}
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-lg mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Adicionar Comida
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Registre o que você comeu em <span className="font-semibold text-emerald-600">{formatDate(currentDate)}</span>
          </p>
        </div>

        {/* Formulário Melhorado */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 border border-emerald-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Novo Alimento</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Comida com Busca IA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Apple className="w-4 h-4 mr-2 text-emerald-500" />
                Nome da Comida
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base"
                  placeholder="ex: Maçã, Arroz, Peito de Frango"
                  required
                />
                <button
                  type="button"
                  onClick={searchCalories}
                  disabled={searchingCalories || !foodName.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Buscar calorias com IA"
                >
                  {searchingCalories ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quantidade e Unidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base"
                  placeholder="Ex: 100, 1, 2"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unidade
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base"
                >
                  <option value="g">gramas (g)</option>
                  <option value="ml">mililitros (ml)</option>
                  <option value="unidade">unidade</option>
                  <option value="xícara">xícara</option>
                  <option value="colher">colher</option>
                  <option value="fatia">fatia</option>
                  <option value="copo">copo</option>
                  <option value="taça">taça</option>
                  <option value="dose">dose</option>
                  <option value="lata">lata</option>
                </select>
              </div>
            </div>

            {/* Calorias */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calorias por {unit}
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base"
                placeholder="Digite as calorias"
                min="0"
                required
              />
            </div>

            {/* Preview do Total de Calorias */}
            {currentFoodTotalCalories > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 text-center border border-emerald-200">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">Total de Calorias</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {currentFoodTotalCalories.toLocaleString()} kcal
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {quantity} {unit} × {calories} kcal
                </p>
              </div>
            )}

            {/* Botão Enviar */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Comida
            </button>
          </form>
        </div>

        {/* Alimentos Comuns por Categoria - Layout Compacto */}
        <div className="space-y-6">
          {Object.entries(commonFoods).map(([category, foods]) => (
            <div key={category} className="bg-white rounded-2xl shadow-lg p-6 mx-4 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-emerald-500" />
                {category}
              </h3>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                {foods.map((food, index) => (
                  <button
                    key={index}
                    onClick={() => selectCommonFood(food)}
                    className="p-2 text-left bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <p className="font-semibold text-gray-900 text-xs truncate" title={food.name}>
                      {food.name}
                    </p>
                    <p className="text-emerald-600 font-medium text-xs">{food.calories} kcal</p>
                    <p className="text-gray-500 text-xs">por {food.unit}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comidas de Hoje - Melhorado */}
        {dailyData.foods.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Utensils className="w-5 h-5 mr-2 text-emerald-500" />
                Comidas de Hoje
              </h3>
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                {totalCalories.toLocaleString()} kcal
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dailyData.foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-200 border border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Apple className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{food.name}</h4>
                      <p className="text-sm text-gray-600">{food.quantity} {food.unit}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(food.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-lg">{(food.calories * food.quantity).toLocaleString()} kcal</p>
                      <p className="text-xs text-gray-500">{food.calories} por {food.unit}</p>
                    </div>
                    <button
                      onClick={() => removeFood(currentDate, food.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dica Profissional */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mx-4 border border-indigo-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
            💡 Dica Profissional
          </h3>
          <p className="text-gray-700">
            Use a busca inteligente com IA para encontrar calorias automaticamente. Para resultados mais precisos, 
            seja específico no nome do alimento (ex: "peito de frango grelhado" ao invés de apenas "frango").
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddFood;