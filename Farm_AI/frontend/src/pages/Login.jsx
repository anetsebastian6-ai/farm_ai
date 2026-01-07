import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../api/api';
import { User, Lock, AlertCircle, Tractor, ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'customer' });
    const [status, setStatus] = useState({ loading: false, error: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });
        try {
            // First try relative API (works when REACT_APP_API_URL is set in api.js or proxy configured)
            let res;
            try {
                res = await api.post('/api/login', formData);
            } catch (innerErr) {
                // fallback to explicit localhost:5000
                res = await axios.post('http://127.0.0.1:5000/api/login', formData);
            }

            const userData = res.data?.user || res.data;
            if (!userData) {
                setStatus({ loading: false, error: 'Invalid response from server' });
                return;
            }

            login(userData);
            setStatus({ loading: false, error: '' });
            navigate(userData.role === 'farmer' ? '/farmer-dashboard' : '/customer-dashboard');
        } catch (err) {
            console.error('Login error:', err);
            const message = err.response?.data?.message || err.message || 'Login failed';
            setStatus({ loading: false, error: message });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80')] bg-cover bg-center relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative z-10"
            >
                <div className="bg-gradient-to-r from-farm-green to-emerald-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform rotate-12 scale-150"></div>
                    <div className="relative z-10 flex justify-center mb-4">
                        <Logo className="h-16 w-16 bg-white rounded-full p-2 shadow-lg" textClassName="hidden" />
                    </div>
                    <h1 className="text-3xl font-bold relative z-10">Welcome Back</h1>
                    <p className="text-green-100 mt-2 relative z-10">Sign in to your Farm AI account</p>
                </div>

                <div className="p-8">
                    {status.error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium border border-red-100"
                        >
                            <AlertCircle size={18} />
                            {status.error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-3 ml-1">Login as...</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['farmer', 'customer'].map((role) => (
                                    <div
                                        key={role}
                                        onClick={() => setFormData({ ...formData, role })}
                                        className={`relative p-3 border-2 rounded-xl cursor-pointer flex flex-col items-center transition-all duration-200 ${formData.role === role ? 'border-farm-green bg-farm-lightGreen/50' : 'border-gray-200 hover:border-farm-green/50 bg-white'}`}
                                    >
                                        {formData.role === role && <div className="absolute top-2 right-2 text-farm-green"><Check size={14} /></div>}
                                        {role === 'farmer' ? <Tractor className={`mb-1 ${formData.role === role ? 'text-farm-green' : 'text-gray-400'}`} size={20} /> : <ShoppingCart className={`mb-1 ${formData.role === role ? 'text-farm-green' : 'text-gray-400'}`} size={20} />}
                                        <span className={`font-bold capitalize text-sm ${formData.role === role ? 'text-farm-darkGreen' : 'text-gray-500'}`}>{role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            icon={User}
                            placeholder="you@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            icon={Lock}
                            placeholder="••••••••"
                        />

                        <div className="mt-8">
                            <Button disabled={status.loading} type="submit" className="shadow-xl shadow-farm-green/20">
                                {status.loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-farm-green font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
