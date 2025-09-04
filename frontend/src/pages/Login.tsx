
import React, { useState } from 'react';
import { api } from '../lib/api';
import { setToken } from '../lib/storage';
import { useNavigate, Link } from 'react-router-dom';
import logo2 from '../assets/img/logoblack.png';
import DiggerButton from '../components/DiggerButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      await setToken(res.data.token);
      navigate('/feed');
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEE1CF]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Logo */}
        <div className="w-full flex justify-center mb-4 mt-8">
          <img src={logo2} alt="DIGGER" className="w-screen" />
        </div>

        <div className="w-full max-w-md mx-auto  rounded-4xl overflow-hidden relative z-10 animate-in">
          <div className="p-2">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold  mb-2">
                Connexion
              </h1>
              <p className="text-primary-600 text-lg">Partagez votre musique du jour</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 backdrop-blur-sm">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-primary-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-primary-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <DiggerButton
                type="submit"
                disabled={loading}
                className="w-full border-black border-2 rounded-xl py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Se connecter</span>
                  </span>
                )}
              </DiggerButton>
            </form>

            <div className="text-center mt-8">
              <p className="text-primary-600">
                Pas encore de compte?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-music-600 hover:text-music-500 transition-colors underline decoration-2 underline-offset-2"
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
