import React from 'react';
import svgLogo from '../../assets/farm-ai-logo.svg';

const Logo = ({ className = "h-10 w-10", textClassName = "text-2xl" }) => (
    <div className="flex items-center gap-3">
        <img src={svgLogo} alt="Farm AI Logo" className={`object-contain ${className}`} />
        <span className={`font-bold tracking-tight text-farm-darkGreen ${textClassName}`}>FARM AI</span>
    </div>
);

export default Logo;
