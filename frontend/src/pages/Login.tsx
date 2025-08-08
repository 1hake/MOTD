
import React, { useState } from 'react';
import { api } from '../lib/api';
import { setToken } from '../lib/storage';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await api.post('/auth/email', { email });
    await setToken(res.data.token);
    navigate('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <input
        className="border p-2 rounded w-64"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Se connecter
      </button>
      <div className="mt-4">
        <p className="text-gray-600">
          Pas encore de compte?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
