import React, { useState, useEffect } from 'react';
import { UserInfo } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface PersonalInfoProps {
  userInfo: UserInfo;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  calculations: {
    bmi: number; bmr: number; tdee: number; bmiCategory: string;
  };
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ userInfo, updateUserInfo, calculations }) => {
    const [localUserInfo, setLocalUserInfo] = useState<UserInfo>(userInfo);
    const debouncedUserInfo = useDebounce(localUserInfo, 500);

    useEffect(() => { setLocalUserInfo(userInfo); }, [userInfo]);

    useEffect(() => {
        if (JSON.stringify(debouncedUserInfo) !== JSON.stringify(userInfo)) {
            updateUserInfo(debouncedUserInfo);
        }
    }, [debouncedUserInfo, userInfo, updateUserInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLocalUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Perfil Pessoal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Idade</label>
                    <input type="number" name="age" value={localUserInfo.age} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label>Peso (kg)</label>
                    <input type="number" name="weight" value={localUserInfo.weight} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label>Altura (cm)</label>
                    <input type="number" name="height" value={localUserInfo.height} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label>Gênero</label>
                    <select name="gender" value={localUserInfo.gender} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label>Nível de Atividade</label>
                    <select name="activityLevel" value={localUserInfo.activityLevel} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="sedentary">Sedentário</option>
                        <option value="lightlyActive">Levemente Ativo</option>
                        <option value="moderatelyActive">Moderadamente Ativo</option>
                        <option value="veryActive">Muito Ativo</option>
                        <option value="extraActive">Extremamente Ativo</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-100 rounded-lg">
                <div>
                    <p className="text-sm text-gray-600">IMC</p>
                    <p className="text-2xl font-bold">{calculations.bmi} ({calculations.bmiCategory})</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Metabolismo Basal (TMB)</p>
                    <p className="text-2xl font-bold">{calculations.bmr} kcal</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Gasto Calórico Diário (TDEE)</p>
                    <p className="text-2xl font-bold">{calculations.tdee} kcal</p>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;
