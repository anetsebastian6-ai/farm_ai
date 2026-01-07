import React, { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetables',
        price: '',
        quantity: '',
        unit: 'kg',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            data.append('image', image);
            data.append('farmerId', user.id || user._id); // Assuming user object has id

            await api.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onProductAdded();
            onClose();
            // Reset form
            setFormData({
                name: '',
                category: 'Vegetables',
                price: '',
                quantity: '',
                unit: 'kg',
                description: ''
            });
            setImage(null);
            setPreview(null);
        } catch (err) {
            console.error('Error adding product:', err);
            setError(err.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="text-2xl font-bold text-gray-800">Add New Crop</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Product Image</label>
                            <div
                                onClick={() => document.getElementById('productImage').click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-farm-green transition-colors cursor-pointer bg-gray-50"
                            >
                                <input
                                    type="file"
                                    id="productImage"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    required
                                />
                                {preview ? (
                                    <div className="relative h-48 w-full">
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white font-medium">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-gray-500">Click to upload photo</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green transition-all"
                                    placeholder="e.g. Organic Tomatoes"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green transition-all bg-white"
                                >
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Grains">Grains</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green transition-all"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green transition-all"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Unit</label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green transition-all bg-white"
                                >
                                    <option value="kg">kg</option>
                                    <option value="gram">gram</option>
                                    <option value="bunch">bunch</option>
                                    <option value="piece">piece</option>
                                    <option value="box">box</option>
                                    <option value="quintal">quintal</option>
                                    <option value="ton">ton</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:border-farm-green transition-all min-h-[100px]"
                                placeholder="Describe your produce (quality, harvest date, etc.)"
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-farm-green text-white py-4 rounded-xl font-bold text-lg hover:bg-farm-darkGreen transition-colors flex items-center justify-center gap-2 shadow-lg shadow-farm-green/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        Publishing Listing...
                                    </>
                                ) : (
                                    'Publish Listing'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddProductModal;
