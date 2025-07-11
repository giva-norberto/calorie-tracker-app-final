import React, { useEffect, useRef, useState } from 'react';
import { UserInfo } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { ActivityLevel, activityFactors } from '../utils/constants';
import { Save } from 'lucide-react';

interface PersonalInfoProps {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ userInfo, setUserInfo }) => {
  // Estado local para inputs
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo>(userInfo);

  // Debounce para evitar atualizações imediatas
  const debouncedLocalUserInfo = useDebounce(localUserInfo, 500);

  // Ref para botão salvar
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);

  // Sincroniza localUserInfo quando prop userInfo muda
  useEffect(() => {
    setLocalUserInfo(userInfo);
  }, [userInfo]);

  // Atualiza estado global userInfo quando localUserInfo debounced muda
  useEffect(() => {
    // Evita atualizar se não mudou
    const isEqual =
      JSON.stringify(debouncedLocalUserInfo) === JSON.stringify(userInfo);

    if (!isEqual) {
      setUserInfo(debouncedLocalUserInfo);
    }
  }, [debouncedLocalUserInfo, userInfo, setUserInfo]);

  // Função para lidar com mudança de inputs (text, number)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setLocalUserInfo((prev) => {
      // Para números, converter corretamente ou setar vazio
      if (
        name === 'age' ||
        name === 'weight' ||
        name === 'leanMass' ||
        name === 'fatPercentage'
      ) {
        // Permite apagar campo (string vazia)
        const numValue = value === '' ? '' : Number(value);

        if (isNaN(numValue)) {
          return prev; // Ignora valor inválido
        }

        return {
          ...prev,
          [name]: numValue,
        };
      }

      if (name === 'activityLevel') {
        // Garante que o valor é um dos ActivityLevel válidos
        if (!Object.values(ActivityLevel).includes(value as ActivityLevel)) {
          return prev;
        }
        return {
          ...prev,
          activityLevel: value as ActivityLevel,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Função que executa ao clicar em salvar
  const handleSave = () => {
    // Aqui poderia ter validação e salvar em backend se quiser
    alert('Dados pessoais salvos!');
  };

  // Calcula TMB (Taxa Metabólica Basal) via Cunningham
  const calculateTMB = (): number => {
    const leanMassNum = Number(localUserInfo.leanMass);
    if (!leanMassNum || leanMassNum <= 0) return 0;

    return 500 + 22 * leanMassNum;
  };

  // Calcula TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (): number => {
    const tmb = calculateTMB();

    // Pega fator de atividade ou padrão 1.2
    const factor =
      activityFactors[localUserInfo.activityLevel] !== undefined
        ? activityFactors[localUserInfo.activityLevel]
        : 1.2;

    return Math.round(tmb * factor);
  };

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
        <div>
          <label htmlFor="age" className="block font-medium mb-1">
            Idade (anos)
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={0}
            max={150}
            value={localUserInfo.age ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="weight" className="block font-medium mb-1">
            Peso (kg)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            min={0}
            max={500}
            step="0.1"
            value={localUserInfo.weight ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="leanMass" className="block font-medium mb-1">
            Massa magra (kg)
          </label>
          <input
            id="leanMass"
            name="leanMass"
            type="number"
            min={0}
            max={500}
            step="0.1"
            value={localUserInfo.leanMass ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="fatPercentage" className="block font-medium mb-1">
            % Gordura corporal
          </label>
          <input
            id="fatPercentage"
            name="fatPercentage"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={localUserInfo.fatPercentage ?? ''}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="activityLevel" className="block font-medium mb-1">
            Nível de atividade física
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={localUserInfo.activityLevel ?? ActivityLevel.SEDENTARY}
            onChange={handleInputChange}
            className="border rounded p-2 w-full"
          >
            {Object.values(ActivityLevel).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <p>
            <strong>TMB (Taxa Metabólica Basal):</strong> {calculateTMB()} kcal
          </p>
          <p>
            <strong>TDEE (Gasto energético diário total):</strong> {calculateTDEE()} kcal
          </p>
        </div>

        <button
          type="submit"
          ref={saveButtonRef}
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
