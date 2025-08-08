import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/feed', label: 'Feed', icon: '📱' },
    { path: '/friends', label: 'Friends', icon: '👥' },
    { path: '/profile', label: 'Profile', icon: '👤' },
];

const Navigation: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/profile') {
            return location.pathname === '/profile' || location.pathname.startsWith('/profile/');
        }
        if (path === '/feed') {
            return location.pathname === '/feed' || location.pathname === '/home';
        }
        return location.pathname === path;
    };

    const isPostActive = location.pathname === '/post';

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 z-50">
            {/* First two nav items */}
            {navItems.slice(0, 2).map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center text-xs ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}

            {/* Central Post button */}


            {/* Last nav item */}
            {navItems.slice(2).map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center text-xs ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};

export default Navigation;
