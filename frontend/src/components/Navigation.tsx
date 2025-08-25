import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/feed', label: 'Feed', icon: '🏠' },
    { path: '/friends', label: 'Friends', icon: '👥' },
    { path: '/profile', label: 'Profile', icon: '👤' }
] as const;

const Navigation: React.FC = () => {
    const { pathname } = useLocation();

    const isActive = (path: string) => {
        if (path === '/profile') return pathname.startsWith('/profile');
        if (path === '/feed') return pathname === '/feed' || pathname === '/home';
        return pathname === path;
    };

    return (
        <nav className="fixed bottom-6 left-4 right-4 flex justify-center z-50">
            <div className="glass-surface rounded-4xl px-6 py-3 max-w-sm w-full">
                <div className="flex justify-around items-center">
                    {navItems.map(({ path, label, icon }) => {
                        const active = isActive(path);
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
                                aria-current={active ? 'page' : undefined}
                            >
                                <span className="text-xl mb-1">{icon}</span>
                                <span className="text-xs font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
