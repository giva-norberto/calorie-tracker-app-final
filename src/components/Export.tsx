import React from 'react';
import { Download, FileText, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { TrackerData } from '../types';

interface ExportProps {
  data: TrackerData;
  resetData: () => void;
}

const Export: React.FC<ExportProps> = ({ data, resetData }) => {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados-rastreador-calorias-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const csvData = [];
    csvData.push(['Data', 'Tipo', 'Nome', 'Quantidade', 'Unidade', 'Calorias', 'Calorias Totais']);

    // Adicionar dados de comida
    Object.entries(data.dailyData).forEach(([date, dailyData]) => {
      dailyData.foods.forEach(food => {
        csvData.push([
          date,
          'Comida',
          food.name,
          food.quantity.toString(),
          food.unit,
          food.calories.toString(),
          (food.calories * food.quantity).toString()
        ]);
      });

      dailyData.exercises.forEach(exercise => {
        csvData.push([
          date,
          'Exercício',
          exercise.name,
          '1',
          'sessão',
          exercise.calories.toString(),
          exercise.calories.toString()
        ]);
      });
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados-rastreador-calorias-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza de que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      resetData();
      alert('Todos os dados foram resetados com sucesso!');
    }
  };

  const totalDays = Object.keys(data.dailyData).length;
  const totalFoods = Object.values(data.dailyData).reduce((sum, day) => sum + day.foods.length, 0);
  const totalExercises = Object.values(data.dailyData).reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Exportar e Resetar</h2>
        <p className="text-gray-600">Baixe seus dados ou resete o rastreador</p>
      </div>

      {/* Resumo dos Dados */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Resumo dos Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">{totalDays}</p>
            <p className="text-sm text-gray-600">Dias de Dados</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">{totalFoods}</p>
            <p className="text-sm text-gray-600">Registros de Comida</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{totalExercises}</p>
            <p className="text-sm text-gray-600">Registros de Exercício</p>
          </div>
        </div>
      </div>

      {/* Opções de Exportação */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Exportar Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportToJSON}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <FileText className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Exportar como JSON</p>
              <p className="text-sm opacity-90">Backup completo dos dados</p>
            </div>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <FileSpreadsheet className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Exportar como CSV</p>
              <p className="text-sm opacity-90">Formato de planilha</p>
            </div>
          </button>
        </div>
      </div>

      {/* Resetar Dados */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <RotateCcw className="w-5 h-5 mr-2 text-red-500" />
          Resetar Dados
        </h3>
        <p className="text-gray-600 mb-6">
          Isso irá deletar permanentemente todos os seus dados de rastreamento incluindo informações pessoais, 
          registros de comida e exercícios. Esta ação não pode ser desfeita.
        </p>
        <button
          onClick={handleReset}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Resetar Todos os Dados
        </button>
      </div>

      {/* Instruções de Importação */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Dica Profissional</h3>
        <p className="text-gray-700">
          Exporte seus dados regularmente para manter backups. Você pode importar arquivos JSON de volta para a 
          aplicação colando o conteúdo no localStorage do seu navegador se necessário.
        </p>
      </div>
    </div>
  );
};

export default Export;