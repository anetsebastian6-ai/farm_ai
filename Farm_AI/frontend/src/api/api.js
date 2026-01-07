import axios from 'axios';

// Default to local Express backend in development so relative API calls
// like `/api/detect-disease` resolve correctly when no REACT_APP_API_URL
// is provided. In production, set `REACT_APP_API_URL` to the real API host.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
