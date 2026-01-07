import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, Leaf, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';


const CategoryCard = ({ title, icon: Icon, delay, isSelected, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ y: -5, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        onClick={onClick}
        className={`bg-white p-8 rounded-2xl shadow-sm border transition-all duration-300 flex flex-col items-center cursor-pointer group ${isSelected ? 'border-farm-green ring-2 ring-farm-green/20' : 'border-gray-100'
            }`}
    >
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${isSelected ? 'bg-farm-green text-white' : 'bg-farm-lightGreen text-farm-green group-hover:bg-farm-green group-hover:text-white'
            }`}>
            <Icon size={32} />
        </div>
        <span className={`font-bold text-lg transition-colors ${isSelected ? 'text-farm-green' : 'text-gray-700 group-hover:text-farm-green'
            }`}>{title}</span>
    </motion.div>
);



const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [priceRange, setPriceRange] = React.useState('all');

    const filteredProducts = products.filter(product => {
        return selectedCategory === 'All' || product.category === selectedCategory;
    });

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            const newHistoryItem = {
                term: searchTerm,
                category: selectedCategory,
                timestamp: new Date().toISOString()
            };

            const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const updatedHistory = [newHistoryItem, ...savedHistory];
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
            navigate('/search-results', { state: { term: searchTerm, category: selectedCategory, priceRange } });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white p-4 sticky top-0 z-50 shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Logo className="h-8 w-8" textClassName="text-xl text-farm-darkGreen" />

                    <div className="flex-1 max-w-md mx-8 hidden md:flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search for fresh vegetables, fruits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-farm-green focus:ring-2 focus:ring-farm-lightGreen outline-none transition-all"
                            />
                        </div>

                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-gray-100 border border-transparent focus:border-farm-green outline-none"
                        >
                            <option value="all">All prices</option>
                            <option value="lt50">Under ₹50</option>
                            <option value="50-100">₹50 - ₹100</option>
                            <option value="gt100">Over ₹100</option>
                        </select>
                    </div>

                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium hidden sm:block">Hi, {user?.name}</span>
                        </div>
                        <button
                            onClick={() => navigate('/search-history')}
                            className="bg-gray-100 text-gray-500 hover:text-farm-green hover:bg-farm-lightGreen transition-colors px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                        >
                            <Store size={18} />
                            History
                        </button>

                        <button
                            onClick={() => navigate('/settings')}
                            className="bg-gray-100 text-gray-500 hover:text-farm-green hover:bg-farm-lightGreen transition-colors px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                            Settings
                        </button>
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-farm-green to-emerald-600 rounded-3xl p-10 text-white mb-10 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-white opacity-10 transform skew-x-12 translate-x-20"></div>
                    <div className="relative z-10 max-w-xl">
                        <h1 className="text-4xl font-bold mb-4">Fresh from the Farm</h1>
                        <p className="text-green-100 text-lg mb-6">Discover locally grown organic produce delivered straight to your doorstep.</p>
                        <button className="bg-white text-farm-green px-8 py-3 rounded-xl font-bold hover:bg-farm-lightGreen transition-colors shadow-lg">
                            Start Shopping
                        </button>
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                    {['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains'].map((cat, i) => (
                        <CategoryCard
                            key={cat}
                            title={cat}
                            icon={Leaf}
                            delay={i * 0.1}
                            isSelected={selectedCategory === cat}
                            onClick={() => setSelectedCategory(cat)}
                        />
                    ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {selectedCategory === 'All' ? 'All Products' : `${selectedCategory}`}
                    </h2>
                    <span className="text-gray-500">{filteredProducts.length} items found</span>
                </div>

                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default CustomerDashboard;
