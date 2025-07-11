import React, { useState } from 'react';
import { User, Heart, Ruler, Weight, Activity, Save, Calculator, Target, ToggleLeft, ToggleRight, TrendingUp, Zap } from 'lucide-react';
import { UserInfo } from '../types';

interface PersonalInfoProps {
  userInfo: UserInfo;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
    bmiCategory: string;
  };
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ userInfo, updateUserInfo, calculations }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field: keyof UserInfo, value: string) => {
    updateUserInfo({ [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    // Feedback visual
    const button = document.getElementById('save-button');
    if (button) {
      button.textContent = 'Salvo!';
      setTimeout(() => {
        button.textContent = 'Salvar Alterações';
      }, 2000);
    }
  };

  const calculateAdvancedMetrics = () => {
    const { age, gender, height, weight, bodyFat } = userInfo;
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const bodyFatNum = parseFloat(bodyFat || '0');

    if (!ageNum || !heightNum || !weightNum || !gender) {
      return null;
    }

    let tmb = 0;
    let leanMass = 0;

    if (bodyFatNum > 0) {
      // Fórmula Katch-McArdle (mais precisa com % gordura)
      leanMass = weightNum * (1 - bodyFatNum / 100);
      tmb = 370 + (21.6 * leanMass);
    } else {
      // Fórmula Harris-Benedict revisada
      if (gender === 'male') {
        tmb = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
      } else {
        tmb = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
      }
      leanMass = weightNum * 0.85; // Estimativa
    }

    // Fatores de atividade mais específicos
    const activityFactors = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      moderatelyActive: 1.55,
      veryActive: 1.725,
      extraActive: 1.9
    };

    const tdee = tmb * activityFactors[userInfo.activityLevel];

    return {
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      leanMass: Math.round(leanMass * 10) / 10
    };
  };

  const advancedMetrics = calculateAdvancedMetrics();

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBMIBgColor = (bmi: number) => {
    if (bmi < 18.5) return 'from-blue-50 to-blue-100';
    if (bmi < 25) return 'from-green-50 to-green-100';
    if (bmi < 30) return 'from-yellow-50 to-yellow-100';
    return 'from-red-50 to-red-100';
  };

  // Calcular peso ideal
  const getIdealWeight = () => {
    const height = parseFloat(userInfo.height);
    if (!height) return null;
    
    const heightM = height / 100;
    const idealBMI = 22; // BMI ideal
    return Math.round(idealBMI * heightM * heightM);
  };

  const idealWeight = getIdealWeight();

  return (
    <div className="space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Perfil Pessoal</h2>
        <p className="text-gray-600">Configure seu perfil para cálculos precisos</p>
      </div>

      {/* Formulário Básico */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Idade */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Idade (anos)
            </label>
            <input
              type="number"
              value={userInfo.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ex: 35"
              min="1"
              max="120"
            />
          </div>

          {/* Gênero */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Gênero
            </label>
            <select
              value={userInfo.gender}
              onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="">Selecione o gênero</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </div>

          {/* Altura */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Ruler className="w-4 h-4 mr-2" />
              Altura (cm)
            </label>
            <input
              type="number"
              value={userInfo.height}
              onChange={(e) => handleChange('height', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ex: 175"
              min="100"
              max="250"
            />
          </div>

          {/* Peso */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Weight className="w-4 h-4 mr-2" />
              Peso atual (kg)
            </label>
            <input
              type="number"
              value={userInfo.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ex: 85"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          {/* Objetivo de Peso */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Objetivo de peso (kg)
            </label>
            <input
              type="number"
              value={userInfo.goalWeight || ''}
              onChange={(e) => handleChange('goalWeight', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ex: 75"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          {/* Nível de Atividade */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Nível de atividade
            </label>
            <select
              value={userInfo.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value as UserInfo['activityLevel'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="sedentary">🪑 Sedentário (pouco ou nenhum exercício)</option>
              <option value="lightlyActive">🚶 1-2x por semana (exercício leve)</option>
              <option value="moderatelyActive">🏃 3-5x por semana (exercício moderado)</option>
              <option value="veryActive">💪 6x ou mais (exercício intenso)</option>
              <option value="extraActive">🔥 Extra Ativo (exercício muito intenso)</option>
            </select>
          </div>

          {/* Meta de Perda por Semana */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Meta de perda por semana (kg)
            </label>
            <input
              type="number"
              value={userInfo.weeklyGoal || ''}
              onChange={(e) => handleChange('weeklyGoal', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ex: 0.5"
              min="0"
              max="2"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Toggle para Opções Avançadas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Opções Avançadas</h3>
            <p className="text-sm text-gray-600">Para atletas e usuários avançados</p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showAdvanced ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showAdvanced ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Formulário Avançado */}
        {showAdvanced && (
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Circunferência da Cintura */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Circunferência da cintura (cm)
                </label>
                <input
                  type="number"
                  value={userInfo.waist || ''}
                  onChange={(e) => handleChange('waist', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Ex: 95"
                  min="50"
                  max="200"
                />
              </div>

              {/* % Gordura Corporal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  % Gordura corporal
                </label>
                <input
                  type="number"
                  value={userInfo.bodyFat || ''}
                  onChange={(e) => handleChange('bodyFat', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Ex: 22.5"
                  min="3"
                  max="50"
                  step="0.1"
                />
              </div>

              {/* Massa Magra */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Massa magra (kg) - opcional
                </label>
                <input
                  type="number"
                  value={userInfo.leanMass || ''}
                  onChange={(e) => handleChange('leanMass', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Ex: 67.2"
                  min="20"
                  max="150"
                  step="0.1"
                />
              </div>

              {/* Tipo Corporal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo corporal
                </label>
                <select
                  value={userInfo.bodyType || ''}
                  onChange={(e) => handleChange('bodyType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Não informado</option>
                  <option value="ectomorfo">Ectomorfo (magro, dificuldade para ganhar peso)</option>
                  <option value="mesomorfo">Mesomorfo (atlético, ganha músculo facilmente)</option>
                  <option value="endomorfo">Endomorfo (tendência a ganhar peso)</option>
                </select>
              </div>
            </div>

            {/* Cálculos Avançados */}
            {advancedMetrics && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  Cálculos Avançados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{advancedMetrics.tmb}</p>
                    <p className="text-sm text-gray-600">TMB Avançado (kcal/dia)</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <p className="text-2xl font-bold text-pink-600">{advancedMetrics.tdee}</p>
                    <p className="text-sm text-gray-600">TDEE Avançado (kcal/dia)</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{advancedMetrics.leanMass}kg</p>
                    <p className="text-sm text-gray-600">Massa Magra Estimada</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      {hasChanges && (
        <div className="text-center mx-4">
          <button
            id="save-button"
            onClick={handleSave}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Alterações
          </button>
        </div>
      )}

      {/* Cálculos Básicos */}
      {calculations.bmi > 0 && (
        <div className="space-y-6">
          {/* Cálculos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-4">
            <div className={`bg-gradient-to-br ${getBMIBgColor(calculations.bmi)} rounded-2xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">IMC</h3>
                <Calculator className="w-5 h-5 text-gray-600" />
              </div>
              <p className={`text-3xl font-bold ${getBMIColor(calculations.bmi)}`}>
                {calculations.bmi}
              </p>
              <p className="text-sm text-gray-600 mt-1">{calculations.bmiCategory}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">TMB</h3>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {advancedMetrics?.tmb || calculations.bmr}
              </p>
              <p className="text-sm text-gray-600 mt-1">calorias/dia</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">TDEE</h3>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {advancedMetrics?.tdee || calculations.tdee}
              </p>
              <p className="text-sm text-gray-600 mt-1">calorias/dia</p>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Peso Ideal */}
              {idealWeight && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Peso Ideal</h4>
                  <p className="text-2xl font-bold text-blue-600">{idealWeight} kg</p>
                  <p className="text-sm text-gray-600">Baseado no IMC ideal (22)</p>
                </div>
              )}

              {/* Diferença do Peso Ideal */}
              {idealWeight && userInfo.weight && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Diferença</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.abs(parseFloat(userInfo.weight) - idealWeight).toFixed(1)} kg
                  </p>
                  <p className="text-sm text-gray-600">
                    {parseFloat(userInfo.weight) > idealWeight ? 'Acima do ideal' : 'Abaixo do ideal'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Explicações */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mx-4 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-500" />
              📊 Entenda seus Cálculos
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>IMC:</strong> Índice de Massa Corporal - indica se seu peso está adequado para sua altura</p>
              <p><strong>TMB:</strong> Taxa Metabólica Basal - calorias que seu corpo queima em repouso</p>
              <p><strong>TDEE:</strong> Gasto Energético Total Diário - calorias que você precisa consumir para manter seu peso</p>
              {showAdvanced && (
                <>
                  <p><strong>Massa Magra:</strong> Peso corporal menos a gordura corporal</p>
                  <p><strong>Cálculo Avançado:</strong> Usa fórmula Katch-McArdle quando % gordura está disponível (mais preciso)</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;