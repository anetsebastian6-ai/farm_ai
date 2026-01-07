import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tractor, LogOut, Leaf, DollarSign, Package, Activity, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';
import AddProductModal from '../components/AddProductModal';
import api from '../api/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden`}
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
            <Icon size={60} />
        </div>
        <div className="relative z-10">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</div>
            <div className={`text-3xl font-bold ${color.replace('bg-', 'text-')}`}>{value}</div>
        </div>
    </motion.div>
);

const FarmerDashboard = () => {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        try {
            const userId = user.id || user._id;
            const res = await api.get(`/api/products/farmer/${userId}`);
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchProducts();
    }, [user, fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/api/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error("Failed to delete product", err);
            }
        }
    };

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-farm-darkGreen text-white p-4 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8 bg-white rounded-lg p-1" textClassName="text-white text-xl" />
                        <span className="text-farm-lightGreen text-sm font-normal opacity-80 border-l border-farm-green pl-2 ml-2">Farmer Portal</span>
                    </div>
                    <div className="flex gap-6 items-center">
                        <span className="font-medium">Welcome, {user?.name}</span>
                        <button
                            onClick={() => window.location.assign('/settings')}
                            className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm font-semibold"
                        >
                            Settings
                        </button>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 bg-farm-green hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-3 gap-6 mb-10"
                >
                    <StatCard title="Listings" value={products.length} icon={Tractor} color={'bg-farm-green'} />
                    <StatCard title="Earnings" value={`₹0`} icon={DollarSign} color={'bg-yellow-500'} />
                    <StatCard title="Orders" value={0} icon={Package} color={'bg-farm-lightGreen'} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-6 mb-10"
                >
                    <Link to="/disease-detection" className="group">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12 scale-150">
                                <Activity size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Activity size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Disease Detection</h3>
                                <p className="text-purple-100 mb-6">Use AI to identify plant diseases from photos instantly.</p>
                                <span className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-purple-50 transition-colors">
                                    Try Now &rarr;
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">My Inventory</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-farm-green text-white px-6 py-2 rounded-xl font-bold hover:bg-farm-darkGreen transition-colors flex items-center gap-2"
                        >
                            <Leaf size={18} /> Add Crop
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-16 text-center text-gray-400">Loading inventory...</div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                            {products.map((product) => (
                                <div key={product._id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-shadow bg-white relative group">
                                    <div className="h-48 rounded-xl bg-gray-100 mb-4 overflow-hidden relative">
                                        <img
                                            src={product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="bg-white/90 text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                            <span className="bg-farm-lightGreen/20 text-farm-green text-xs font-bold px-2 py-1 rounded-lg">
                                                {product.category}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-farm-darkGreen">₹{product.price}<span className="text-sm text-gray-400 font-normal">/{product.unit}</span></span>
                                            <span className="text-sm text-gray-500 font-medium">Stock: {product.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="bg-farm-lightGreen/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Leaf className="h-10 w-10 text-farm-green" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Your inventory is empty</h3>
                            <p className="text-gray-500 max-w-md mx-auto">Start listing your fresh produce to reach customers directly. Add your first crop now!</p>
                        </div>
                    )}
                </div>
            </main>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProductAdded={fetchProducts}
            />
        </div>
    );
};

export default FarmerDashboard;
