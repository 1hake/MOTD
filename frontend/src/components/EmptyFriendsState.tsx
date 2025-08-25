import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyFriendsState: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center card py-16 px-8 animate-in">
            <div className="space-y-4">
                <div className="relative">
                    <div className="text-6xl mb-4 animate-pulse-gentle">👥</div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-300 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                    <p className="text-lg font-medium text-primary-700">Vos amis n'ont pas encore partagé de musique aujourd'hui</p>
                    <p className="text-sm text-primary-500">Invitez-les à partager leurs découvertes musicales !</p>
                </div>
                <button
                    onClick={() => navigate('/friends')}
                    className="btn-primary"
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
