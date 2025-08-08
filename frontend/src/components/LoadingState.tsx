import React from 'react';

interface LoadingStateProps {
    message?: string;
    className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Chargement...',
    className = 'min-h-[calc(100vh-8rem)]'
}) => {
    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div className="text-gray-600 font-medium">{message}</div>
            </div>
        </div>
    );
};

export default LoadingState;
