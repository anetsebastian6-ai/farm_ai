import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { term, category, priceRange } = location.state || { term: '', category: 'All', priceRange: 'all' };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const prodName = (product.name || product.title || '').toString();
            const prodCategory = (product.category || 'Uncategorized').toString();
            const rawPrice = (product.price != null ? product.price : 0).toString();
            const numericPrice = parseFloat(rawPrice.replace(/[^0-9.-]/g, '')) || 0;

            const matchesCategory = category === 'All' || prodCategory.toLowerCase() === category.toString().toLowerCase();
            const matchesSearch = prodName.toLowerCase().includes((term || '').toLowerCase());

            let matchesPrice = true;
            if (priceRange === 'lt50') matchesPrice = numericPrice < 50;
            else if (priceRange === '50-100') matchesPrice = numericPrice >= 50 && numericPrice <= 100;
            else if (priceRange === 'gt100') matchesPrice = numericPrice > 100;

            return matchesCategory && matchesSearch && matchesPrice;
        });
    }, [term, category, priceRange]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/customer-dashboard')}
                        className="flex items-center text-gray-600 hover:text-farm-green transition-colors mr-4"
                    >
                        <ArrowLeft className="mr-2" size={20} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Search Results for "{term}"
                    </h1>
                    <div className="ml-6 text-sm text-gray-500">{category && category !== 'All' ? `Category: ${category} • ` : ''}{priceRange && priceRange !== 'all' ? `Price: ${priceRange}` : ''}</div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Search size={48} className="mb-4 opacity-50" />
                        <p className="text-xl">No items found matching your search.</p>
                        <button
                            onClick={() => navigate('/customer-dashboard')}
                            className="mt-4 text-farm-green font-semibold hover:underline"
                        >
                            Browse all products
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 mb-6">{filteredProducts.length} items found</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
