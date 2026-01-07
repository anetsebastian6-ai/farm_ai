import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/api';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const DiseaseDetection = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Try the app API proxy first (express backend), then fall back to direct python service if needed
            let res;
            try {
                res = await api.post('/api/detect-disease', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } catch (innerErr) {
                // Fallback to direct Python service on port 7000
                res = await axios.post('http://127.0.0.1:7000/disease-predict', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Normalize response: backend returns the disease object directly
            const data = res.data || {};
            // Ensure keys are present and arrays where expected
            if (data && Object.keys(data).length) {
                // Some responses may wrap values differently; normalize common keys
                const normalized = {
                    Crop: data.Crop || data.crop || data.crop_name || '',
                    Disease: data.Disease || data.disease || data.label || '',
                    Cause: data.Cause || data.cause || data.Causes || [],
                    Prevent_Cure: data.Prevent_Cure || data.Prevent || data.Prevent_Cure || data.Prevent_Cures || []
                };
                // Ensure arrays for lists
                if (normalized.Cause && !Array.isArray(normalized.Cause)) normalized.Cause = [normalized.Cause];
                if (normalized.Prevent_Cure && !Array.isArray(normalized.Prevent_Cure)) normalized.Prevent_Cure = [normalized.Prevent_Cure];
                setResult(normalized);
                navigate('/disease-result', { state: { result: normalized, image: preview } });
            } else {
                setError('No prediction returned from the analysis service.');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            // Prefer server-provided error messages when available
            const serverMsg = err.response?.data?.error || err.response?.data?.message || err.response?.data?.details;
            setError(serverMsg || err.message || 'Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
                <div className="bg-gradient-to-r from-farm-green to-emerald-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">AI Plant Disease Detection</h1>
                    <p className="text-green-100">Upload a photo of your plant leaf to identify diseases instantly.</p>
                </div>

                <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-farm-green transition-colors cursor-pointer relative bg-gray-50"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                ) : (
                                    <div className="py-12">
                                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                        <p className="text-gray-500 font-medium">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!file || loading}
                                    className="w-full py-3 text-lg shadow-lg shadow-farm-green/20"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader className="animate-spin" size={20} /> Analyzing...
                                        </span>
                                    ) : 'Analyze Plant'}
                                </Button>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full overflow-y-auto max-h-[600px]">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Result</h3>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-bold">Error</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {!result && !error && !loading && (
                                <div className="text-center py-12 text-gray-400">
                                    <p>Results will appear here after analysis.</p>
                                </div>
                            )}

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle className="text-farm-green" size={24} />
                                            <h4 className="text-lg font-bold text-gray-800">Prediction</h4>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Crop</span>
                                            <p className="text-lg font-semibold text-gray-900">{result.Crop}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Disease</span>
                                            <p className="text-2xl font-bold text-farm-darkGreen capitalize">
                                                {result.Disease}
                                            </p>
                                        </div>
                                    </div>

                                    {result.Cause && (
                                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                            <h4 className="font-bold text-orange-800 mb-3">Causes</h4>
                                            <ul className="space-y-2">
                                                {Array.isArray(result.Cause) ? result.Cause.map((cause, idx) => (
                                                    <li key={idx} className="text-orange-900 text-sm flex gap-2">
                                                        <span className="select-none">•</span>
                                                        <span>{cause.replace(/^\d+\.\s*/, '')}</span>
                                                    </li>
                                                )) : <p className="text-orange-900 text-sm">{result.Cause}</p>}
                                            </ul>
                                        </div>
                                    )}

                                    {result.Prevent_Cure && (
                                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                            <h4 className="font-bold text-blue-800 mb-3">Prevention & Cure</h4>
                                            <ul className="space-y-2">
                                                {result.Prevent_Cure.map((step, idx) => (
                                                    <li key={idx} className="text-blue-900 text-sm flex gap-2">
                                                        <span className="select-none">•</span>
                                                        <span>{step.replace(/^\d+\.\s*/, '')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DiseaseDetection;
