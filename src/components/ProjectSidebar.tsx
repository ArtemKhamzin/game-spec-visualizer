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
          <div className="text-sm text-gray-800 space-y-2">
          <p>
            &#128100; Чтобы сохранять проекты,&nbsp;
            <span
              onClick={onLoginClick}
              className="cursor-pointer underline hover:text-blue-600 text-black"
            >
              войдите в аккаунт
            </span>
            .
          </p>
          <p>
            Нет аккаунта?&nbsp;
            <span
              onClick={onRegisterClick}
              className="cursor-pointer underline hover:text-blue-600 text-black"
            >
              Зарегистрируйтесь
            </span>
            .
          </p>
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
