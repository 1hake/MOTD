import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken } from '../lib/storage';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get token from URL query params
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            // Store token and redirect to home
            setToken(token);
            navigate('/home');
        } else {
            // If no token found, redirect to login
            navigate('/');
        }
    }, [location, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-700">Connexion en cours...</p>
        </div>
    );
}
