import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Toast = () => {
    const { toast } = useCart();

    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg font-semibold text-white z-50 ${
                isSuccess ? 'bg-green-500' : 'bg-blue-500'
            }`}
        >
            {toast.message}
        </motion.div>
    );
};

export default Toast;
