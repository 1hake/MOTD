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
            <div className="flex flex-col items-center space-y-6 animate-in">
                <div className="relative">
                    <div className="w-16 h-16 bg-pop-pink border-3 border-black rounded-2xl shadow-neo animate-bounce"></div>
                    <div className="absolute inset-0 w-16 h-16 border-3 border-black rounded-2xl animate-ping opacity-20"></div>
                </div>
                <div className="text-black font-black text-xl italic uppercase tracking-wider">{message}</div>
            </div>
        </div>
    );
};

export default LoadingState;
