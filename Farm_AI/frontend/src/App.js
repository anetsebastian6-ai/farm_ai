import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Toast from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProducts from './pages/CustomerProducts';
import CustomerOrders from './pages/CustomerOrders';
import DiseaseDetection from './pages/DiseaseDetection';
import DetectionResult from './pages/DetectionResult';
import Purchase from './pages/Purchase';
import Cart from './pages/Cart';
import SearchHistory from './pages/SearchHistory';
import SearchResults from './pages/SearchResults';
import Settings from './pages/Settings';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-farm-green">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'farmer' ? '/farmer-dashboard' : '/customer-dashboard'} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Toast />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/farmer-dashboard"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/disease-detection"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <DiseaseDetection />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/disease-result"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <DetectionResult />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer-dashboard"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer/products"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerProducts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerOrders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <Purchase />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <Cart />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/search-history"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <SearchHistory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/search-results"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <SearchResults />
                  </ProtectedRoute>
                }
              />




              <Route path="/" element={<Navigate to="/login" />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider >
  );
}

export default App;