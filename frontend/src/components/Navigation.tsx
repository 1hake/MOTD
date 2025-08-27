import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';

type NavItem = { path: string; label: string; icon: any };

const navItems: NavItem[] = [
    { path: '/feed', label: 'Feed', icon: faMusic },
    { path: '/friends', label: 'Friends', icon: faUserGroup },
    { path: '/profile', label: 'Profile', icon: faUser }
];

const Navigation: React.FC = () => {
    const { pathname } = useLocation();

    const isActive = (path: string) => {
        if (path === '/profile') return pathname.startsWith('/profile');
        if (path === '/feed') return pathname === '/feed' || pathname === '/home';
        return pathname === path;
    };

    return (
        <nav className="fixed bottom-6 left-8 right-8 flex justify-center z-50">
            <div className="bg-white/70 backdrop-blur-md border border-white/30 shadow-lg rounded-3xl px-3 py-2 max-w-sm w-full">
                <ul className="flex justify-between items-center gap-1">
                    {navItems.map(({ path, label, icon }) => {
                        const active = isActive(path);
                        const base = "relative flex items-center justify-center w-10 h-10 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-music-500/40";
                        const activeCls = "text-music-600";
                        const inactiveCls = "text-primary-500 hover:text-primary-700";
                        return (
                            <li key={path} className="flex-1 flex justify-center">
                                <Link
                                    to={path}
                                    aria-label={label}
                                    aria-current={active ? 'page' : undefined}
                                    className={`${base} ${active ? activeCls : inactiveCls}`}
                                >
                                    <FontAwesomeIcon icon={icon} className="text-xl" />
                                    <span className="sr-only">{label}</span>

                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
