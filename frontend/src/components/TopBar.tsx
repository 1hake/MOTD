import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

type TopBarAction = {
    label: string;
    icon: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
};

const TopBar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const getPageInfo = (): { title: string; actions: TopBarAction[] } => {
        switch (location.pathname) {
            case '/feed':
                return {
                    title: 'Feed du jour',
                    actions: [
                        {
                            label: 'Poster',
                            icon: '➕',
                            onClick: () => navigate('/post'),
                            variant: 'primary'
                        },
                        {
                            label: 'Playlist',
                            icon: '🎵',
                            onClick: () => navigate('/playlist'),
                            variant: 'accent'
                        }
                    ]
                };
            case '/post':
                return {
                    title: 'Poster une chanson',
                    actions: []
                };
            case '/friends':
                return {
                    title: 'Mes amis',
                    actions: [
                        {
                            label: 'Feed',
                            icon: '📱',
                            onClick: () => navigate('/feed'),
                            variant: 'secondary'
                        }
                    ]
                };
            case '/history':
                return {
                    title: 'Mon historique',
                    actions: [
                        {
                            label: 'Profil',
                            icon: '👤',
                            onClick: () => navigate('/profile'),
                            variant: 'accent'
                        }
                    ]
                };
            case '/profile':
                return {
                    title: 'Profil',
                    actions: [
                        {
                            label: 'Historique',
                            icon: '📝',
                            onClick: () => navigate('/history'),
                            variant: 'accent'
                        },
                        {
                            label: 'Feed',
                            icon: '📱',
                            onClick: () => navigate('/feed'),
                            variant: 'secondary'
                        }
                    ]
                };
            case '/playlist':
                return {
                    title: 'Playlist du jour',
                    actions: [
                        {
                            label: 'Feed',
                            icon: '📱',
                            onClick: () => navigate('/feed'),
                            variant: 'secondary'
                        }
                    ]
                };
            default:
                return {
                    title: 'MOTD',
                    actions: []
                };
        }
    };

    const getButtonClasses = (variant: string = 'secondary') => {
        const baseClasses = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1';
        switch (variant) {
            case 'primary':
                return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
            case 'accent':
                return `${baseClasses} bg-purple-600 text-white hover:bg-purple-700`;
            case 'secondary':
            default:
                return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`;
        }
    };

    const { title, actions } = getPageInfo();

    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                <div className="flex items-center gap-2">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={getButtonClasses(action.variant)}
                        >
                            <span>{action.icon}</span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
