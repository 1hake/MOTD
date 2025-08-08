import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import LogoutButton from './components/LogoutButton';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen pb-16 relative bg-gray-50">
            <div className="absolute top-4 right-4 z-10">
                <LogoutButton />
            </div>
            <Outlet />
            <Navigation />
        </div>
    );
};

export default Layout;
