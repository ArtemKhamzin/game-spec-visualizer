'use client';

import React from 'react';

interface Props {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

const ProjectSidebar: React.FC<Props> = ({ isLoggedIn, onLoginClick, onRegisterClick, onLogout }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)]">
      <div className="flex-grow flex flex-col">
        <h2 className="text-lg font-bold mb-4">Проекты</h2>

        {!isLoggedIn ? (
          <div className="flex flex-col gap-3">
            <button onClick={onLoginClick} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Войти
            </button>
            <button onClick={onRegisterClick} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Регистрация
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between">
            <div className="flex-1 overflow-auto text-sm text-gray-600">
              <p>[Список проектов]</p>
            </div>

            <div className="pt-4">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
