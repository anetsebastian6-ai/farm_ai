import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Purchase = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

    const product = location.state?.product;
    const buyNow = location.state?.buyNow || false;
    const [quantity, setQuantity] = useState(product ? 1 : null);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi');

    // Determine if we're in buy-now mode (single product) or cart mode (multiple items)
    const isBuyNow = buyNow && product;
    const checkoutItems = isBuyNow ? [{ ...product, quantity }] : cart;

    if (!isBuyNow && cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
                    <button
                        onClick={() => navigate('/customer/products')}
                        className="px-6 py-3 bg-farm-green text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const total = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleConfirm = (e) => {
        e.preventDefault();
        if (!address.trim()) {
            alert('Please enter delivery address');
            return;
        }
        const orderData = {
            items: checkoutItems,
            totalAmount: total,
            totalItems: itemCount,
            address,
            paymentMethod,
            timestamp: new Date().toISOString(),
        };
        console.log('Order confirmed:', orderData);
        alert(`Order Confirmed!\nItems: ${itemCount}\nTotal: ₹${total}\nPayment: ${paymentMethod}`);
        clearCart();
        navigate('/customer/orders');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 mb-8 hover:text-farm-green transition-colors"
                >
                    <ArrowLeft className="mr-2" size={20} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            <div className="bg-farm-green p-8 text-white">
                                <h1 className="text-3xl font-bold">{isBuyNow ? 'Quick Checkout' : 'Review Your Order'}</h1>
                                <p className="opacity-90 mt-2">{itemCount} item{itemCount !== 1 ? 's' : ''} ready for delivery</p>
                            </div>

                            <div className="p-8">
                                {/* Order Items List */}
                                <div className="space-y-4 mb-8">
                                    {checkoutItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
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
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.category}</p>
                                                <p className="text-farm-green font-bold mt-1">₹{item.price} each</p>
                                            </div>
                                            <div className="text-right">
                                                {isBuyNow ? (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <button
                                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center font-semibold">{quantity}</span>
                                                        <button
                                                            onClick={() => setQuantity(quantity + 1)}
                                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="font-bold text-gray-800">₹{item.price * item.quantity}</p>
                                            </div>
                                            {!isBuyNow && (
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Address */}
                                <form onSubmit={handleConfirm} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Full Delivery Address</label>
                                        <textarea
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your complete delivery address..."
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-farm-green focus:ring-2 focus:ring-green-100 outline-none transition-all h-32 resize-none"
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-3">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['upi', 'card', 'netbanking', 'cod'].map((method) => (
                                                <label key={method} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: paymentMethod === method ? '#10b981' : '#e5e7eb'}}>
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value={method}
                                                        checked={paymentMethod === method}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <span className="font-semibold capitalize">{method === 'cod' ? 'COD' : method.toUpperCase()}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-farm-green text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Truck size={24} />
                                        Confirm Order
                                    </motion.button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div>
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-6">
                            <div className="bg-gray-100 p-6 border-b">
                                <h3 className="font-bold text-gray-800 text-lg">Order Summary</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600 font-semibold">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Taxes & Charges</span>
                                    <span>₹0</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span className="text-farm-green">₹{total}</span>
                                </div>
                                {!isBuyNow && cart.length > 0 && (
                                    <button
                                        onClick={() => clearCart()}
                                        className="w-full mt-4 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-semibold transition"
                                    >
                                        Clear Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
