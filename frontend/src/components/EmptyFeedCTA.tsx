import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyFeedCTAProps {
    show: boolean;
}

const EmptyFeedCTA: React.FC<EmptyFeedCTAProps> = ({ show }) => {
    const navigate = useNavigate();

    if (!show) return null;

    return (
        <div className="z-10 bg-gradient-to-r from-music-500 via-accent-500 to-music-600 rounded-3xl shadow-xl p-6 border border-music-200/50 backdrop-blur-sm animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-inner">
                        <span className="text-2xl">🎵</span>
                    </div>
                    <div className="text-white">
                        <h3 className="text-lg font-bold mb-1">Vous n'avez pas encore partagé votre chanson du jour !</h3>
                        <p className="text-white/80 text-sm">Partagez votre musique préférée avec vos amis.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/post')}
                    className="btn-secondary text-music-700 hover:text-music-800"
                >
                    <span className="flex items-center gap-2">
                        ➕ <span>Poster ma chanson</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default EmptyFeedCTA;
