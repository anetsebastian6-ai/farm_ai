import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, getTotalItems } = useCart();

    const [src, setSrc] = React.useState(product.image || (product.imageLocal ? `/${product.imageLocal}` : `https://source.unsplash.com/600x400/?${encodeURIComponent(product.name)}`));
    const useGoogle = (typeof window !== 'undefined') && localStorage.getItem('useGoogleImages') === 'true';

    React.useEffect(() => {
        setSrc(product.image || (product.imageLocal ? `/${product.imageLocal}` : `https://source.unsplash.com/600x400/?${encodeURIComponent(product.name)}`));
    }, [product]);

    React.useEffect(() => {
        let mounted = true;
        if (useGoogle && !product.image) {
            // ask backend for a Google image link for this product name
            fetch(`/api/search-image?q=${encodeURIComponent(product.name)}`)
                .then(r => r.json())
                .then(data => {
                    if (!mounted) return;
                    if (data && data.link) setSrc(data.link);
                })
                .catch(() => {
                    // keep current src
                });
        }
        return () => { mounted = false; };
    }, [product.id, product.name, useGoogle, product.image]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="h-40 bg-gray-50 rounded-lg overflow-hidden mb-4">
                <img
                    src={src}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        // try fallback to remote Unsplash if local file missing, otherwise placeholder
                        try {
                            if ((product.image || product.imageLocal) && !e.currentTarget.dataset.triedRemote) {
                                e.currentTarget.dataset.triedRemote = '1';
                                setSrc(`https://source.unsplash.com/600x400/?${encodeURIComponent(product.name)}`);
                                return;
                            }
                        } catch (err) {
                            // ignore
                        }
                        setSrc('https://via.placeholder.com/600x400?text=No+Image');
                    }}
                />
            </div>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <span className="font-bold text-farm-green">₹{product.price}/{product.unit}</span>
            </div>
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => addToCart(product, 1)}
                    className="flex-1 py-2 bg-farm-lightGreen text-farm-green font-semibold rounded-lg hover:bg-green-100 transition-colors"
                >
                    Add to Cart
                </button>
                <button
                    onClick={() => navigate('/purchase', { state: { product, buyNow: true } })}
                    className="flex-1 py-2 bg-farm-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                    Buy Now
                </button>
                <button
                    onClick={() => navigate('/cart')}
                    className="relative py-2 px-3 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-colors"
                    title="View Cart"
                >
                    <ShoppingCart size={20} />
                    {getTotalItems() > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {getTotalItems()}
                        </span>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
