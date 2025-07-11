import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import { UserInfo } from '../types';

interface PersonalInfoProps {
  initialUserInfo: UserInfo;
  onSave: (userInfo: UserInfo) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ initialUserInfo, onSave }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);
  const debouncedUserInfo = useDebounce(userInfo, 500);

  useEffect(() => {
    onSave(debouncedUserInfo);
  }, [debouncedUserInfo, onSave]);

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
    </div>
  );
};

export default PersonalInfo;

