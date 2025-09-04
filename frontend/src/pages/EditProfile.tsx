import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';

type User = {
    id: number;
    email: string;
    name?: string;
    profileImage?: string;
    platformPreference?: string;
};

type PlatformOption = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

const platformOptions: PlatformOption[] = [
    { id: 'spotify', name: 'Spotify', icon: '🎵', color: 'from-green-500 to-green-600' },
    { id: 'apple', name: 'Apple Music', icon: '🍎', color: 'from-gray-500 to-gray-600' },
    { id: 'deezer', name: 'Deezer', icon: '🎧', color: 'from-orange-500 to-orange-600' },
    { id: 'youtube', name: 'YouTube Music', icon: '📺', color: 'from-red-500 to-red-600' }
];

export default function EditProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        platformPreference: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const token = await getToken();
            if (!token) return navigate('/');

            const userId = getUserIdFromToken(token);
            if (!userId) {
                console.error('Could not get user ID from token');
                return navigate('/');
            }

            try {
                setLoading(true);
                const userRes = await api.get(`/users/${userId}`);
                const userData = userRes.data;
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    platformPreference: userData.platformPreference || ''
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Erreur lors du chargement des données utilisateur');
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving || !user) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updateData: any = {};

            // Only include fields that have changed
            if (formData.name !== (user.name || '')) {
                updateData.name = formData.name || null;
            }
            if (formData.email !== user.email) {
                updateData.email = formData.email;
            }
            if (formData.platformPreference !== (user.platformPreference || '')) {
                updateData.platformPreference = formData.platformPreference || null;
            }

            // Only make the request if there are changes
            if (Object.keys(updateData).length > 0) {
                await api.put(`/users/${user.id}`, updateData);
                setSuccess('Profil mis à jour avec succès !');

                // Update local user state
                setUser(prev => prev ? { ...prev, ...updateData } : null);

                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/profile');
                }, 1500);
            } else {
                setSuccess('Aucune modification détectée');
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour du profil';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    if (loading) {
        return <LoadingState message="Chargement des paramètres..." />;
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
                <div className="text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <div className="text-xl font-semibold text-red-600">Erreur de chargement</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-100">
            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Modifier le profil</h1>
                            <p className="text-gray-400">Personnalisez vos informations et préférences</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                                <span className="text-red-400 text-lg">⚠️</span>
                                <span className="text-red-300">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                                <span className="text-green-400 text-lg">✅</span>
                                <span className="text-green-300">{success}</span>
                            </div>
                        )}

                        {/* Profile Picture Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-300">
                                Photo de profil
                            </label>
                            <div className="flex items-center gap-6">
                                {/* Current Avatar */}
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>

                                {/* Upload Button (placeholder for future implementation) */}
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        disabled
                                        className="px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg cursor-not-allowed opacity-50"
                                    >
                                        Changer la photo
                                    </button>
                                    <p className="text-xs text-gray-500">Fonctionnalité bientôt disponible</p>
                                </div>
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-300">
                                Nom d'affichage
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                                placeholder="Votre nom d'affichage"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                disabled={saving}
                            />
                            <p className="text-xs text-gray-500">Ce nom sera visible par vos amis</p>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        {/* Platform Preference */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-300">
                                Plateforme musicale préférée
                            </label>
                            <p className="text-xs text-gray-500 mb-4">
                                Sélectionnez votre plateforme préférée pour les liens musicaux
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {platformOptions.map((platform) => (
                                    <button
                                        key={platform.id}
                                        type="button"
                                        onClick={() => handleInputChange('platformPreference', platform.id)}
                                        disabled={saving}
                                        className={`
                                            p-4 rounded-lg border-2 transition-all duration-200 
                                            ${formData.platformPreference === platform.id
                                                ? `border-transparent bg-gradient-to-r ${platform.color} text-white shadow-lg transform scale-105`
                                                : 'border-gray-700/50 bg-gray-800/30 text-gray-300 hover:border-gray-600/50 hover:bg-gray-800/50'
                                            }
                                            ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{platform.icon}</span>
                                            <span className="font-medium">{platform.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Clear selection option */}
                            {formData.platformPreference && (
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('platformPreference', '')}
                                    disabled={saving}
                                    className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
                                >
                                    Effacer la sélection
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-lg hover:from-indigo-700 hover:to-fuchsia-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sauvegarde...
                                    </>
                                ) : (
                                    'Sauvegarder'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
