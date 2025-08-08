import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/storage';

// SVG Icons for auth providers
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
    </svg>
);

const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.462,14.23c-0.146,0.378-0.315,0.736-0.509,1.071c-0.278,0.481-0.507,0.815-0.687,1.001 c-0.274,0.252-0.566,0.382-0.879,0.389c-0.225,0-0.497-0.064-0.812-0.194c-0.316-0.129-0.605-0.193-0.869-0.193 c-0.276,0-0.573,0.064-0.889,0.193c-0.316,0.13-0.571,0.198-0.763,0.202c-0.294,0.013-0.588-0.118-0.881-0.391 c-0.195-0.2-0.438-0.543-0.729-1.025c-0.313-0.511-0.571-1.104-0.771-1.775c-0.213-0.723-0.32-1.425-0.32-2.105 c0-0.781,0.168-1.455,0.507-2.021c0.266-0.458,0.619-0.819,1.061-1.081c0.442-0.264,0.918-0.398,1.429-0.411 c0.281,0,0.649,0.085,1.105,0.253c0.455,0.167,0.746,0.253,0.876,0.253c0.107,0,0.469-0.099,1.086-0.297 c0.582-0.184,1.075-0.261,1.478-0.232c1.094,0.088,1.914,0.52,2.462,1.296c-0.979,0.592-1.462,1.421-1.452,2.481 c0.01,0.826,0.307,1.513,0.894,2.056c0.266,0.246,0.565,0.438,0.899,0.573C16.739,13.779,16.607,14.01,16.462,14.23z M12.742,4.656c0.008,0.08,0.012,0.16,0.012,0.24c0,0.602-0.22,1.165-0.657,1.686c-0.529,0.621-1.167,0.979-1.858,0.923 c-0.008-0.07-0.013-0.142-0.013-0.221c0-0.562,0.244-1.162,0.677-1.659c0.216-0.253,0.492-0.464,0.825-0.631 C12.060,4.836,12.399,4.729,12.742,4.656z" />
    </svg>
);

const SpotifyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10c5.523,0,10-4.477,10-10C22,6.477,17.523,2,12,2 M16.586,16.424 c-0.18,0.295-0.563,0.387-0.857,0.207c-2.348-1.435-5.304-1.76-8.785-0.964c-0.335,0.077-0.67-0.133-0.746-0.469 c-0.077-0.335,0.132-0.67,0.469-0.746c3.809-0.871,7.077-0.496,9.713,1.115C16.673,15.746,16.766,16.13,16.586,16.424 M17.81,13.7 c-0.226,0.367-0.706,0.482-1.072,0.257c-2.687-1.652-6.785-2.131-9.965-1.166C6.36,12.917,5.925,12.684,5.8,12.273 C5.675,11.86,5.908,11.425,6.32,11.3c3.632-1.102,8.147-0.568,11.234,1.328C17.92,12.854,18.035,13.334,17.81,13.7 M17.915,10.865 c-3.223-1.914-8.54-2.09-11.618-1.156C5.804,9.859,5.281,9.58,5.131,9.086C4.982,8.591,5.26,8.069,5.755,7.919 c3.532-1.072,9.404-0.865,13.115,1.338c0.445,0.264,0.59,0.838,0.327,1.282C18.933,10.983,18.359,11.129,17.915,10.865" />
    </svg>
);

export default function Signup() {
    const navigate = useNavigate();

    // Mock function to simulate signup - in a real app would connect to backend
    const signupWithEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            // In a real app, this would validate and create an account
            const response = await api.post('/auth/signup', { email, password });
            setToken(response.data.token);
            navigate('/home');
        } catch (error) {
            console.error('Signup failed:', error);
            alert('Signup failed. Please try again.');
        }
    };

    // Mock OAuth functions - in a real app these would redirect to provider auth pages
    const signupWithGoogle = async () => {
        try {
            // In a real app, this would redirect to Google OAuth
            const response = await api.post('/auth/google');
            setToken(response.data.token);
            navigate('/home');
        } catch (error) {
            console.error('Google signup failed:', error);
            alert('Google signup failed. Please try again.');
        }
    };

    const signupWithApple = async () => {
        try {
            // In a real app, this would redirect to Apple OAuth
            const response = await api.post('/auth/apple');
            setToken(response.data.token);
            navigate('/home');
        } catch (error) {
            console.error('Apple signup failed:', error);
            alert('Apple signup failed. Please try again.');
        }
    };

    const signupWithSpotify = async () => {
        try {
            // In a real app, this would redirect to Spotify OAuth
            const response = await api.post('/auth/spotify');
            setToken(response.data.token);
            navigate('/home');
        } catch (error) {
            console.error('Spotify signup failed:', error);
            alert('Spotify signup failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">MOTD</h1>
                        <p className="text-gray-600 mt-2">Partagez votre musique du jour</p>
                    </div>

                    {/* Email Signup Form */}
                    <form onSubmit={signupWithEmail} className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="votre@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white rounded-lg py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            S'inscrire avec Email
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={signupWithGoogle}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <GoogleIcon />
                        </button>
                        <button
                            onClick={signupWithApple}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <AppleIcon />
                        </button>
                        <button
                            onClick={signupWithSpotify}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <SpotifyIcon />
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Déjà un compte?{' '}
                            <Link
                                to="/"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
