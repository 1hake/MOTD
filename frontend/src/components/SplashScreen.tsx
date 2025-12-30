import React from 'react';
import logo from '../assets/img/logoblack.png';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-pop-yellow animate-in fade-in duration-500" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
      <div className="flex flex-col items-center space-y-8">
        <div className="relative animate-bounce-slow">
          <img
            src={logo}
            alt="DIGGER"
            className="w-64 md:w-80 h-auto"
          />
        </div>

        {/* Optional: Add a subtle loading indicator or text */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

