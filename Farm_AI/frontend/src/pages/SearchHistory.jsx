import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, X, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem('searchHistory');
        setHistory([]);
    };

    const deleteItem = (index) => {
        const newHistory = [...history];
        newHistory.splice(index, 1);
        setHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/customer-dashboard')}
                        className="flex items-center text-gray-600 hover:text-farm-green transition-colors"
                    >
                        <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
                    </button>

                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                        >
                            Clear History
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
                    <div className="bg-farm-green p-8 text-white">
                        <div className="flex items-center gap-3">
                            <History size={32} />
                            <h1 className="text-3xl font-bold">Search History</h1>
                        </div>
                        <p className="opacity-90 mt-2">View your recent searches and interests.</p>
                    </div>

                    <div className="p-8">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Search size={48} className="mb-4 opacity-50" />
                                <p className="text-xl">No search history yet.</p>
                                <p className="text-sm">Searches will appear here after you press Enter.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {history.map((item, index) => (
                                        <motion.div
                                            key={index} // Using index as key since no unique ID, and items are prepended
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group border border-gray-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-farm-lightGreen flex items-center justify-center text-farm-green">
                                                    <Search size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{item.term}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">
                                                            {item.category}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {new Date(item.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteItem(index)}
                                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                            >
                                                <X size={20} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchHistory;
