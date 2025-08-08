import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import TopBar from './components/TopBar';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen pb-16 pt-16 relative bg-gray-50">
            <TopBar />
            <Outlet />
            <Navigation />
        </div>
    );
};

export default Layout;
