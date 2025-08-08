import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/post', label: 'Post', icon: '➕' },
    { path: '/history', label: 'History', icon: '📜' },
    { path: '/friends', label: 'Friends', icon: '👥' },
];

const Navigation: React.FC = () => {
    const location = useLocation();
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center text-xs ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};

export default Navigation;
