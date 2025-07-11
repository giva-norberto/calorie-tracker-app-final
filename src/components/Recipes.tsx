import React, { useState } from 'react';
import { ChefHat, Plus, Clock, Users, Star, Trash2, Edit, Search, Filter, BookOpen } from 'lucide-react';
import { Recipe, RecipeIngredient, NutritionInfo } from '../types';

interface RecipesProps {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  removeRecipe: (id: number) => void;
  addFoodFromRecipe: (recipe: Recipe, servings: number) => void;
}

const Recipes: React.FC<RecipesProps> = ({
  recipes,
  addRecipe,
  removeRecipe,
  addFoodFromRecipe
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servings: 1,
    prepTime: 0,
    cookTime: 0,
    difficulty: 'easy' as const,
    tags: '',
    instructions: ['']
  });

  const [ingredients, setIngredients] = useState<Omit<RecipeIngredient, 'id'>[]>([
    { name: '', quantity: 0, unit: 'g', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 } }
  ]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      servings: 1,
      prepTime: 0,
      cookTime: 0,
      difficulty: 'easy',
      tags: '',
      instructions: ['']
    });
    setIngredients([
      { name: '', quantity: 0, unit: 'g', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 } }
    ]);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {
      name: '',
      quantity: 0,
      unit: 'g',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: {
          ...updated[index][parent as keyof typeof updated[index]],
          [child]: value
        }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...formData.instructions];
    updated[index] = value;
    setFormData({ ...formData, instructions: updated });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  const calculateTotalNutrition = (): NutritionInfo => {
    return ingredients.reduce((total, ingredient) => ({
      calories: total.calories + (ingredient.nutrition.calories * ingredient.quantity),
      protein: total.protein + (ingredient.nutrition.protein * ingredient.quantity),
      carbs: total.carbs + (ingredient.nutrition.carbs * ingredient.quantity),
      fat: total.fat + (ingredient.nutrition.fat * ingredient.quantity),
      fiber: total.fiber + (ingredient.nutrition.fiber * ingredient.quantity),
      sugar: total.sugar + (ingredient.nutrition.sugar * ingredient.quantity),
      sodium: total.sodium + (ingredient.nutrition.sodium * ingredient.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || ingredients.length === 0 || formData.instructions.filter(i => i.trim()).length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const totalNutrition = calculateTotalNutrition();
    
    const newRecipe: Omit<Recipe, 'id' | 'createdAt'> = {
      ...formData,
      ingredients: ingredients.map((ing, index) => ({ ...ing, id: index + 1 })),
      totalNutrition,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      instructions: formData.instructions.filter(instruction => instruction.trim())
    };

    addRecipe(newRecipe);
    resetForm();
    setShowCreateForm(false);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  if (selectedRecipe) {
    return (
      <div className="space-y-6 pb-20">
        {/* Cabeçalho da Receita */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Voltar às receitas
          </button>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedRecipe.name}</h1>
              <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-500" />
                  {selectedRecipe.servings} porções
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-500" />
                  {selectedRecipe.prepTime + selectedRecipe.cookTime} min total
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                  {getDifficultyLabel(selectedRecipe.difficulty)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                const servings = prompt('Quantas porções você quer adicionar?', '1');
                if (servings && parseInt(servings) > 0) {
                  addFoodFromRecipe(selectedRecipe, parseInt(servings));
                  alert('Receita adicionada ao seu diário!');
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Adicionar ao Diário
            </button>
          </div>

          {/* Tags */}
          {selectedRecipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedRecipe.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Informações Nutricionais */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Informações Nutricionais (por porção)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{Math.round(selectedRecipe.totalNutrition.calories / selectedRecipe.servings)}</p>
              <p className="text-sm text-gray-600">Calorias</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(selectedRecipe.totalNutrition.protein / selectedRecipe.servings)}g</p>
              <p className="text-sm text-gray-600">Proteínas</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{Math.round(selectedRecipe.totalNutrition.carbs / selectedRecipe.servings)}g</p>
              <p className="text-sm text-gray-600">Carboidratos</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{Math.round(selectedRecipe.totalNutrition.fat / selectedRecipe.servings)}g</p>
              <p className="text-sm text-gray-600">Gorduras</p>
            </div>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ingredientes</h3>
          <div className="space-y-2">
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{ingredient.quantity} {ingredient.unit}</span>
                <span className="ml-2 text-gray-700">{ingredient.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modo de Preparo */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Modo de Preparo</h3>
          <div className="space-y-4">
            {selectedRecipe.instructions.map((instruction, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg mb-4">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Receitas Personalizadas</h2>
        <p className="text-gray-600">Crie e gerencie suas receitas favoritas</p>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar receitas..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todas as dificuldades</option>
              <option value="easy">Fácil</option>
              <option value="medium">Médio</option>
              <option value="hard">Difícil</option>
            </select>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Receita
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Receitas */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {recipe.servings} porções
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {recipe.prepTime + recipe.cookTime} min
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => removeRecipe(recipe.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Informações Nutricionais Resumidas */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-sm font-bold text-red-600">{Math.round(recipe.totalNutrition.calories / recipe.servings)}</p>
                  <p className="text-xs text-gray-600">kcal</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-bold text-blue-600">{Math.round(recipe.totalNutrition.protein / recipe.servings)}g</p>
                  <p className="text-xs text-gray-600">prot</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-sm font-bold text-green-600">{Math.round(recipe.totalNutrition.carbs / recipe.servings)}g</p>
                  <p className="text-xs text-gray-600">carb</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-bold text-yellow-600">{Math.round(recipe.totalNutrition.fat / recipe.servings)}g</p>
                  <p className="text-xs text-gray-600">gord</p>
                </div>
              </div>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {recipe.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{recipe.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Receita
                </button>
                <button
                  onClick={() => {
                    const servings = prompt('Quantas porções você quer adicionar?', '1');
                    if (servings && parseInt(servings) > 0) {
                      addFoodFromRecipe(recipe, parseInt(servings));
                      alert('Receita adicionada ao seu diário!');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma Receita Encontrada</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterDifficulty !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando sua primeira receita personalizada!'
            }
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Criar Primeira Receita
          </button>
        </div>
      )}

      {/* Modal de Criação de Receita */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Nova Receita</h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Receita *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Porções</label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo de Preparo (min)</label>
                    <input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({...formData, prepTime: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo de Cozimento (min)</label>
                    <input
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({...formData, cookTime: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dificuldade</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    placeholder="ex: vegetariano, low-carb, proteico"
                  />
                </div>

                {/* Ingredientes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Ingredientes *</h4>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Adicionar Ingrediente
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            placeholder="Nome do ingrediente"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qtd"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            step="0.1"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={ingredient.unit}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="unidade">unidade</option>
                            <option value="xícara">xícara</option>
                            <option value="colher">colher</option>
                          </select>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={ingredient.nutrition.calories}
                            onChange={(e) => updateIngredient(index, 'nutrition.calories', parseFloat(e.target.value) || 0)}
                            placeholder="Calorias por unidade"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instruções */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Modo de Preparo *</h4>
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Adicionar Passo
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Passo ${index + 1}...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações Nutricionais Calculadas */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações Nutricionais (Total)</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{Math.round(calculateTotalNutrition().calories)}</p>
                      <p className="text-sm text-gray-600">Calorias</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{Math.round(calculateTotalNutrition().protein)}g</p>
                      <p className="text-sm text-gray-600">Proteínas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{Math.round(calculateTotalNutrition().carbs)}g</p>
                      <p className="text-sm text-gray-600">Carboidratos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">{Math.round(calculateTotalNutrition().fat)}g</p>
                      <p className="text-sm text-gray-600">Gorduras</p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Criar Receita
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;