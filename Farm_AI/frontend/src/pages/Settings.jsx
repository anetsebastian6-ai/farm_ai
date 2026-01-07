import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    // local state for settings
    const [weatherAlerts, setWeatherAlerts] = useState(localStorage.getItem('weatherAlerts') === 'true');
    const [cropAlerts, setCropAlerts] = useState(localStorage.getItem('cropDiseaseAlerts') === 'true');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    // edit form state
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const saveProfile = () => {
        const updated = { ...(user || {}), name: editName, email: editEmail };
        try {
            localStorage.setItem('farm_ai_user', JSON.stringify(updated));
        } catch (e) { }
        // attempt to persist basic profile name/email to settings endpoint
        if (user?.id) {
            api.put(`/api/settings/${user.id}`, { name: editName, email: editEmail }).catch(() => { });
        }
        // refresh so other pages pick up the change
        window.location.reload();
    };

    const changePassword = () => {
        const saved = user || JSON.parse(localStorage.getItem('farm_ai_user') || '{}');
        if (saved && saved.password && oldPassword !== saved.password) {
            alert('Old password does not match');
            return;
        }
        saved.password = newPassword;
        localStorage.setItem('farm_ai_user', JSON.stringify(saved));
        alert('Password updated');
        setShowChangePassword(false);
    };

    const handleLogout = () => {
        try { localStorage.removeItem('farm_ai_user'); } catch (e) { }
        navigate('/login');
    };

    const toggleWeather = (val) => {
        setWeatherAlerts(val);
        localStorage.setItem('weatherAlerts', val ? 'true' : 'false');
        if (user?.id) {
            api.put(`/api/settings/${user.id}`, { weatherAlerts: !!val }).catch(() => { });
        }
    };

    const toggleCrop = (val) => {
        setCropAlerts(val);
        localStorage.setItem('cropDiseaseAlerts', val ? 'true' : 'false');
        if (user?.id) {
            api.put(`/api/settings/${user.id}`, { cropAlerts: !!val }).catch(() => { });
        }
    };

    const changeLang = (lng) => {
        setLanguage(lng);
        localStorage.setItem('language', lng);
        if (user?.id) {
            api.put(`/api/settings/${user.id}`, { language: lng }).catch(() => { });
        }
    };

    useEffect(() => {
        // fetch persisted settings from backend if user is logged in
        const load = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/api/settings/${user.id}`);
                const s = res.data || {};
                if (typeof s.weatherAlerts !== 'undefined') {
                    setWeatherAlerts(!!s.weatherAlerts);
                    localStorage.setItem('weatherAlerts', s.weatherAlerts ? 'true' : 'false');
                }
                if (typeof s.cropAlerts !== 'undefined') {
                    setCropAlerts(!!s.cropAlerts);
                    localStorage.setItem('cropDiseaseAlerts', s.cropAlerts ? 'true' : 'false');
                }
                if (s.language) {
                    setLanguage(s.language);
                    localStorage.setItem('language', s.language);
                }
                if (s.theme) {
                    // apply theme server-side preference by toggling if needed
                    if (s.theme === 'dark' && theme !== 'dark') toggleTheme();
                    if (s.theme === 'light' && theme === 'dark') toggleTheme();
                }
            } catch (err) {
                // ignore - fallback to localStorage
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <nav className="bg-white dark:bg-gray-800 p-4 sticky top-0 z-50 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Logo className="h-8 w-8" textClassName="text-xl text-farm-darkGreen" />
                    <div>
                        <span className="mr-4">{user?.name}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
                    <h2 className="font-semibold mb-2">Images</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose whether to load images from Google (requires server-side API key) or use local placeholders.</p>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={localStorage.getItem('useGoogleImages') === 'true'}
                                onChange={(e) => {
                                    localStorage.setItem('useGoogleImages', e.target.checked ? 'true' : 'false');
                                    // force reload so product cards pick up the change
                                    window.location.reload();
                                }}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Use Google Images</span>
                        </label>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Current: <strong>{localStorage.getItem('useGoogleImages') === 'true' ? 'Google' : 'Local'}</strong></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="font-semibold mb-2">Account</h2>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setShowEditProfile(true)} className="px-4 py-2 bg-farm-green text-white rounded-lg w-44 text-left hover:bg-green-700 transition-colors">Edit Profile</button>
                            <button onClick={() => setShowChangePassword(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg w-44 text-left hover:bg-yellow-600 transition-colors">Change Password</button>
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg w-44 text-left hover:bg-red-600 transition-colors">Logout</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="font-semibold mb-2">Notifications</h2>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded text-farm-green focus:ring-farm-green" checked={weatherAlerts} onChange={(e) => toggleWeather(e.target.checked)} />
                                <span>Weather Alerts</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded text-farm-green focus:ring-farm-green" checked={cropAlerts} onChange={(e) => toggleCrop(e.target.checked)} />
                                <span>Crop Disease Alerts</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="font-semibold mb-2">Preferences</h2>
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Language</div>
                                <select value={language} onChange={(e) => changeLang(e.target.value)} className="mt-2 p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-farm-green">
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="es">Spanish</option>
                                    <option value="ml">Malayalam</option>
                                </select>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Theme</div>
                                <button onClick={toggleTheme} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="font-semibold mb-2">About</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">FARM AI — Agriculture assistant app for farmers and buyers.</p>
                        <button onClick={() => setAboutOpen(true)} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">About App</button>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {showEditProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold">Edit Profile</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-farm-green focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-farm-green focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEditProfile(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProfile}
                                    className="px-6 py-2 bg-farm-green text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showChangePassword && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold">Change Password</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Old Password</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowChangePassword(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={changePassword}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/20"
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Modal */}
                {aboutOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                            <div className="p-6 text-center">
                                <Logo className="h-16 w-16 mx-auto mb-4" textClassName="hidden" />
                                <h3 className="text-2xl font-bold mb-2 text-farm-darkGreen">FARM AI</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Version 1.0.0</p>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Empowering farmers with AI-driven insights for better crop health and productivity.
                                    Connecting farmers directly with buyers.
                                </p>
                                <div className="text-sm text-gray-400">
                                    &copy; {new Date().getFullYear()} Farm AI. All rights reserved.
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-center">
                                <button
                                    onClick={() => setAboutOpen(false)}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Settings;
