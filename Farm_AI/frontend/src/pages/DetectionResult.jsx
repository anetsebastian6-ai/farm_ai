import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// removed unused useAuth import
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ArrowLeft, ThermometerSun, Droplets, Sprout, Bug } from 'lucide-react';
// removed unused api import

const DetectionResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;

    // If no state (direct access), redirect back
    useEffect(() => {
        if (!state || !state.result) {
            navigate('/disease-detection');
        }
    }, [state, navigate]);

    if (!state || !state.result) return null;

    const { result, image } = state;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/disease-detection')}
                    className="flex items-center gap-2 text-gray-500 hover:text-farm-green mb-8 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Scanner
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-8"
                >
                    {/* Left Column: Image & Basic Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 overflow-hidden">
                            <div className="aspect-square rounded-2xl overflow-hidden relative">
                                <img
                                    src={image}
                                    alt="Analyzed Plant"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Sprout size={100} className="text-farm-green" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Detected Crop</h2>
                            <h1 className="text-4xl font-extrabold text-gray-800 mb-6">{result.Crop}</h1>

                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Condition</h2>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-bold ${result.Disease.toLowerCase().includes('healthy')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {result.Disease.toLowerCase().includes('healthy') ? (
                                    <CheckCircle size={24} />
                                ) : (
                                    <AlertTriangle size={24} />
                                )}
                                {result.Disease}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Analysis */}
                    <div className="space-y-6">
                        {/* Causes */}
                        {result.Cause && result.Cause.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:bg-orange-200 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                                            <Bug size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800">Possible Causes</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {Array.isArray(result.Cause) ? result.Cause.map((cause, idx) => (
                                            <li key={idx} className="flex gap-4 items-start">
                                                <div className="min-w-[24px] h-[24px] rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-sm font-bold mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-gray-600 font-medium leading-relaxed">{cause.replace(/^\d+\.\s*/, '')}</p>
                                            </li>
                                        )) : <p className="text-gray-600">{result.Cause}</p>}
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* Prevention & Cure */}
                        {result.Prevent_Cure && result.Prevent_Cure.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group"
                            >
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:bg-blue-200 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                                            <ThermometerSun size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800">Treatment Plan</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {result.Prevent_Cure.map((step, idx) => (
                                            <li key={idx} className="flex gap-4 items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 hover:border-blue-200 transition-colors">
                                                <div className="min-w-[24px] h-[24px] rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-bold mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-gray-600 font-medium leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* Recommendations Widget */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-farm-green/5 p-6 rounded-2xl border border-farm-green/10 text-center">
                                <Droplets className="mx-auto text-farm-green mb-3" size={32} />
                                <h4 className="font-bold text-gray-800 mb-1">Watering</h4>
                                <p className="text-sm text-gray-500">Monitor soil moisture levels</p>
                            </div>
                            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 text-center">
                                <ThermometerSun className="mx-auto text-yellow-500 mb-3" size={32} />
                                <h4 className="font-bold text-gray-800 mb-1">Sunlight</h4>
                                <p className="text-sm text-gray-500">Ensure optimal light exposure</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DetectionResult;
