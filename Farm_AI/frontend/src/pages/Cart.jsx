import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-300 mb-8 hover:text-farm-green transition-colors"
                    >
                        <ArrowLeft className="mr-2" size={20} /> Back
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
                        <ShoppingCart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Cart is Empty</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Add some fresh products to get started!</p>
                        <button
                            onClick={() => navigate('/customer/products')}
                            className="px-6 py-3 bg-farm-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const total = getTotalPrice();
    const itemCount = cart.length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 dark:text-gray-300 mb-8 hover:text-farm-green transition-colors"
                >
                    <ArrowLeft className="mr-2" size={20} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                            <div className="bg-farm-green p-8 text-white">
                                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                                <p className="opacity-90 mt-2">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
                            </div>

                            <div className="p-8 space-y-4">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                    >
                                        {/* Product Image */}
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image || (item.imageLocal ? `/${item.imageLocal}` : `https://source.unsplash.com/300x300/?${encodeURIComponent(item.name)}`)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                }}
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                            <p className="text-farm-green font-bold mt-1">₹{item.price} each</p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded font-semibold"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-800 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded font-semibold"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right min-w-fit">
                                            <p className="font-bold text-gray-800 dark:text-white">₹{item.price * item.quantity}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">x{item.quantity}</p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Continue Shopping */}
                            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700">
                                <button
                                    onClick={() => navigate('/customer/products')}
                                    className="text-farm-green font-semibold hover:text-green-700 transition-colors"
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden sticky top-6">
                            <div className="bg-gray-100 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Order Summary</h3>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Cart Items Breakdown */}
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>Subtotal</span>
                                        <span>₹{total}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>Delivery</span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>Taxes</span>
                                        <span>₹0</span>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between font-bold text-lg">
                                        <span className="text-gray-800 dark:text-white">Total</span>
                                        <span className="text-farm-green">₹{total}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/purchase')}
                                        className="w-full bg-farm-green text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors"
                                    >
                                        Proceed to Checkout
                                    </motion.button>
                                    <button
                                        onClick={() => clearCart()}
                                        className="w-full px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
