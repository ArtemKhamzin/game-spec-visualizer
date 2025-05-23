'use client';

import React from 'react';

interface Props {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
  projects?: any[];
  onProjectClick?: (project: any) => void;
  onDeleteProject?: (id: string) => void;
  selectedProjectId: string | null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ProjectSidebar: React.FC<Props> = ({
  isLoggedIn,
  onLoginClick,
  onRegisterClick,
  onLogout,
  projects,
  onProjectClick,
  onDeleteProject,
  selectedProjectId
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)]">
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Проекты</h2>
          {isLoggedIn && (
            <img
              src="/assets/icons/logout_icon.svg"
              alt="Выйти"
              title="Выйти из аккаунта"
              onClick={onLogout}
              className="w-6 h-6 cursor-pointer hover:opacity-80"
            />
          )}
        </div>

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
            {projects?.length ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`
                    p-3 mb-2 rounded border cursor-pointer shadow-sm
                    ${selectedProjectId === project.id ? 'border-gray-500 bg-[#ededed]' : 'border-gray-300 hover:bg-gray-200'}
                  `}
                  onClick={() => onProjectClick?.(project)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-base text-black">
                      &#128196; {project.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Удалить проект "${project.name}"?`)) {
                          onDeleteProject?.(project.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                      title="Удалить проект"
                    >
                      ✕
                    </button>
                  </div>
                    
                  <div className="text-xs text-gray-500 mt-1">
                    Изменён: {formatDate(project.updatedAt)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Проектов пока нет</p>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
