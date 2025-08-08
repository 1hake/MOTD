import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyFeedCTAProps {
    show: boolean;
}

const EmptyFeedCTA: React.FC<EmptyFeedCTAProps> = ({ show }) => {
    const navigate = useNavigate();

    if (!show) return null;

    return (
        <div className="sticky top-20 z-10 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-xl p-6 border border-emerald-200/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-inner">
                        <span className="text-2xl">🎵</span>
                    </div>
                    <div className="text-white">
                        <h3 className="text-lg font-bold mb-1">Vous n'avez pas encore partagé votre chanson du jour !</h3>
                        <p className="text-emerald-100 text-sm">Partagez votre musique préférée avec vos amis.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/post')}
                    className="bg-white/95 backdrop-blur-sm text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 shadow-md border border-white/50"
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
