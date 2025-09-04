import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/storage';
import logo2 from '../assets/img/logoblack.png';
import DiggerButton from '../components/DiggerButton';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return; // Prevent multiple submissions

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/signup', { email, password });
            await setToken(response.data.token);
            navigate('/feed');
        } catch (error: any) {
            console.error('Signup failed:', error);
            const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
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
                                Inscription
                            </h1>
                            <p className="text-primary-600 text-lg">Partagez votre musique du jour</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
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
                                    minLength={6}
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-primary-500 flex items-center gap-2">
                                    <span className="text-sm">🔒</span>
                                    <span>Minimum 6 caractères</span>
                                </p>
                            </div>
                            <DiggerButton
                                type="submit"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                                        Inscription...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <span>S'inscrire</span>
                                    </span>
                                )}
                            </DiggerButton>
                        </form>

                        <div className="text-center mt-8">
                            <p className="text-primary-600">
                                Déjà un compte?{' '}
                                <Link
                                    to="/"
                                    className="font-semibold text-music-600 hover:text-music-500 transition-colors underline decoration-2 underline-offset-2"
                                >
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
