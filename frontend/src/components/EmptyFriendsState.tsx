import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyFriendsState: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 py-16 px-8">
            <div className="space-y-4">
                <div className="relative">
                    <div className="text-6xl mb-4 animate-bounce">👥</div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">Vos amis n'ont pas encore partagé de musique aujourd'hui</p>
                    <p className="text-sm text-gray-500">Invitez-les à partager leurs découvertes musicales !</p>
                </div>
                <button
                    onClick={() => navigate('/friends')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <span className="flex items-center gap-2">
                        👥 <span>Gérer mes amis</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default EmptyFriendsState;
