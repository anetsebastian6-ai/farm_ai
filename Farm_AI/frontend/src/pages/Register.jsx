import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Mail, Tractor, ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
    const [status, setStatus] = useState({ loading: false, error: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });
        try {
            await axios.post('http://127.0.0.1:5000/api/register', formData);
            navigate('/login');
        } catch (err) {
            setStatus({ loading: false, error: err.response?.data?.message || 'Registration failed' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1625246333195-58197bd47d26?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80')] bg-cover bg-center relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative z-10"
            >
                <div className="p-10">
                    <div className="flex justify-center mb-6">
                        <Logo className="h-12 w-12" textClassName="text-3xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Join Farm AI</h2>
                    <p className="text-center text-gray-500 mb-8">Start your journey with us today</p>

                    {status.error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                            {status.error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} icon={User} placeholder="devadarsh" />
                            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="devadarsh@gmail.com" />
                        </div>
                        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} icon={Lock} placeholder="Create a password" />

                        <div className="mb-8">
                            <label className="block text-gray-700 text-sm font-bold mb-3 ml-1">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['farmer', 'customer'].map((role) => (
                                    <div
                                        key={role}
                                        onClick={() => setFormData({ ...formData, role })}
                                        className={`relative p-4 border-2 rounded-2xl cursor-pointer flex flex-col items-center transition-all duration-200 ${formData.role === role ? 'border-farm-green bg-farm-lightGreen/50' : 'border-gray-100 hover:border-farm-green/50 bg-white'}`}
                                    >
                                        {formData.role === role && <div className="absolute top-2 right-2 text-farm-green"><Check size={16} /></div>}
                                        {role === 'farmer' ? <Tractor className={`mb-2 ${formData.role === role ? 'text-farm-green' : 'text-gray-400'}`} /> : <ShoppingCart className={`mb-2 ${formData.role === role ? 'text-farm-green' : 'text-gray-400'}`} />}
                                        <span className={`font-bold capitalize ${formData.role === role ? 'text-farm-darkGreen' : 'text-gray-500'}`}>{role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button disabled={status.loading} type="submit" variant="primary" className="shadow-xl shadow-farm-green/20">
                            {status.loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-farm-green font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
