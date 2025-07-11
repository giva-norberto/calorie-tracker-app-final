import React, { useEffect, useState, useMemo } from 'react'; // O useMemo foi adicionado aqui
import { UserInfo } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { ActivityLevel, activityFactors } from '../utils/constants';
import { Save } from 'lucide-react';

interface PersonalInfoProps {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ userInfo, setUserInfo }) => {
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo>(userInfo);
  const debouncedLocalUserInfo = useDebounce(localUserInfo, 500);

  useEffect(() => {
    setLocalUserInfo(userInfo);
  }, [userInfo]);

  useEffect(() => {
    const isEqual = JSON.stringify(debouncedLocalUserInfo) === JSON.stringify(userInfo);
    if (!isEqual) {
      setUserInfo(debouncedLocalUserInfo);
    }
  }, [debouncedLocalUserInfo, userInfo, setUserInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // A atualização já acontece via debounce, mas aqui podemos forçar um salvamento ou dar feedback.
    setUserInfo(localUserInfo); // Garante que a última alteração seja salva
    alert('Dados pessoais salvos!');
  };

  // OTIMIZAÇÃO 1: TMB é calculado com useMemo.
  // Só será recalculado se a massa magra (leanMass) mudar.
  const tmb = useMemo((): number => {
    const leanMassNum = Number(localUserInfo.leanMass);
    if (!leanMassNum || leanMassNum <= 0) return 0;
    return Math.round(500 + 22 * leanMassNum);
  }, [localUserInfo.leanMass]);

  // OTIMIZAÇÃO 2: TDEE também é calculado com useMemo.
  // Só será recalculado se o TMB (que depende da massa magra) ou o nível de atividade mudarem.
  const tdee = useMemo((): number => {
    const factor = activityFactors[localUserInfo.activityLevel] ?? 1.2;
    return Math.round(tmb * factor);
  }, [tmb, localUserInfo.activityLevel]);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4"
      >
        {/* Idade */}
        <div>
          <label htmlFor="age" className="block font-medium mb-1">
            Idade (anos)
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={localUserInfo.age ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Peso */}
        <div>
          <label htmlFor="weight" className="block font-medium mb-1">
            Peso (kg)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            value={localUserInfo.weight ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Massa Magra */}
        <div>
          <label htmlFor="leanMass" className="block font-medium mb-1">
            Massa magra (kg)
          </label>
          <input
            id="leanMass"
            name="leanMass"
            type="number"
            step="0.1"
            value={localUserInfo.leanMass ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* % Gordura */}
        <div>
          <label htmlFor="fatPercentage" className="block font-medium mb-1">
            % Gordura corporal
          </label>
          <input
            id="fatPercentage"
            name="fatPercentage"
            type="number"
            step="0.1"
            value={localUserInfo.fatPercentage ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Nível de Atividade */}
        <div>
          <label htmlFor="activityLevel" className="block font-medium mb-1">
            Nível de atividade física
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={localUserInfo.activityLevel}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          >
            {Object.entries(activityFactors).map(([key, value]) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ({value}x)
              </option>
            ))}
          </select>
        </div>

        {/* Resultados */}
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p>
            <strong>TMB (Taxa Metabólica Basal):</strong> {tmb} kcal
          </p>
          <p>
            <strong>TDEE (Gasto energético diário total):</strong> {tdee} kcal
          </p>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          id="save-button"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          <Save size={16} />
          Salvar
        </button>
      </form>
    </section>
  );
};

export default PersonalInfo;
