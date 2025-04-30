'use client';

import React from 'react';

interface Props {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const ProjectSidebar: React.FC<Props> = ({ isLoggedIn, onLoginClick, onRegisterClick }) => {
  return (
    <div className="p-4 border-r overflow-auto h-full flex-shrink-0 bg-[var(--background)]" style={{ width: '300px' }}>
      <h2 className="text-lg font-bold mb-4">Проекты</h2>

      {!isLoggedIn ? (
        <div className="flex flex-col gap-3">
          <button onClick={onLoginClick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Войти
          </button>
          <button onClick={onRegisterClick} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Регистрация
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">[Тут будет список проектов]</p>
      )}
    </div>
  );
};

export default ProjectSidebar;
