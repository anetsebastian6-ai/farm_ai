import React from 'react';

const Input = ({ label, type, name, value, onChange, placeholder, icon: Icon }) => (
    <div className="mb-5">
        {label && <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">{label}</label>}
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-farm-green transition-colors">
                    <Icon className="h-5 w-5" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-farm-green focus:ring-4 focus:ring-farm-lightGreen outline-none transition-all duration-200 bg-gray-50 focus:bg-white`}
            />
        </div>
    </div>
);

export default Input;
