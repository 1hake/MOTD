import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen pb-16 relative bg-gray-50">
            <Outlet />
            <Navigation />
        </div>
    );
};

export default Layout;
