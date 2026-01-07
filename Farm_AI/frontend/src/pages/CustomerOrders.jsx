import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const OrderRow = ({ order }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
    <div>
      <div className="font-bold">{order.productName || order.product?.name || 'Product'}</div>
      <div className="text-sm text-gray-500">Quantity: {order.quantity}</div>
    </div>
    <div className="text-right">
      <div className={`px-3 py-1 rounded-lg ${order.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</div>
    </div>
  </div>
);

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const id = user.id || user._id || user.userId;
        const res = await api.get(`/api/order/buyer/${id}`);
        if (!mounted) return;
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-gray-500">No orders yet.</div>
            ) : orders.map(o => <OrderRow key={o._id || o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
