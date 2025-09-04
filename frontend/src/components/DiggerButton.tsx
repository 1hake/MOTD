import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
}

const DiggerButton: React.FC<ButtonProps> = ({ children, onClick, type = "button" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="
        w-full
        bg-[#f5f0e6] 
        text-gray-800 
        font-medium 
        py-3 
        rounded-xl 
        border 
        border-gray-800 
        hover:bg-gray-100 
        hover:shadow-md 
        active:scale-[0.98] 
        transition-all 
        duration-200
      "
        >
            {children}
        </button>
    );
};

export default DiggerButton;