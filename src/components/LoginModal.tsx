'use client';

import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<Props> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Неверные данные для входа');
        return;
      }

      const json = await res.json();
      localStorage.setItem('token', json.token);
      onLoginSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Ошибка при входе');
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4">Вход</h2>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Отмена</button>
          <button onClick={handleLogin} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Войти</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
