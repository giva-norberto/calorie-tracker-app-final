import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import { UserInfo } from '../types';

// Props esperadas (exemplo)
interface PersonalInfoProps {
  initialUserInfo: UserInfo;
  onSave: (userInfo: UserInfo) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ initialUserInfo, onSave }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);

  // Debounce para evitar múltiplos saves muito rápidos
  const debouncedUserInfo = useDebounce(userInfo, 500);

  // Quando debouncedUserInfo muda, chama onSave
  useEffect(() => {
    onSave(debouncedUserInfo);
  }, [debouncedUserInfo, onSave]);

  // Exemplo simples de campo de input para nome
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserInfo(prev => ({
      ...prev,
      name: e.target.value,
    }));
  }

  return (
    <div>
      <label htmlFor="name">Nome:</label>
      <input
        id="name"
        type="text"
        value={userInfo.name || ''}
        onChange={handleChange}
      />
      {/* Aqui você pode adicionar outros campos como peso, altura, etc */}
    </div>
  );
};
import useDebounce from '../hooks/useDebounce';  // sem chaves {}, pois é export default
