import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    onClick,
    disabled,
    className = '',
    variant = 'primary',
    type = 'button'
}) => {
    const baseStyles = "w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 flex justify-center items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-farm-green to-emerald-500 text-white hover:from-farm-darkGreen hover:to-emerald-600",
        secondary: "bg-white text-farm-green border-2 border-farm-green hover:bg-farm-lightGreen",
        danger: "bg-red-500 text-white hover:bg-red-600",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {disabled ? <Loader2 className="animate-spin h-5 w-5" /> : children}
        </motion.button>
    );
};

export default Button;
