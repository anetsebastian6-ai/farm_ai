import React, { useEffect, useState } from 'react';
import api from '../api/api';
import ProductCard from '../components/ProductCard';



const CustomerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(p => {
    const name = (p.name || p.title || p.productName || '').toString();
    const desc = (p.description || p.summary || '').toString();
    // Normalize price: strip non-numeric characters and parse float
    const rawPrice = (p.price != null ? p.price : (p.cost != null ? p.cost : 0)).toString();
    const numericPrice = parseFloat(rawPrice.replace(/[^0-9.-]/g, '')) || 0;
    const qTrim = (q || '').toString().trim().toLowerCase();

    if (qTrim) {
      const matchesName = name.toLowerCase().includes(qTrim);
      const matchesDesc = desc.toLowerCase().includes(qTrim);
      if (!matchesName && !matchesDesc) return false;
    }

    if (filterPrice === 'lt50' && !(numericPrice < 50)) return false;
    if (filterPrice === '50-100' && !(numericPrice >= 50 && numericPrice <= 100)) return false;
    if (filterPrice === 'gt100' && !(numericPrice > 100)) return false;
    return true;
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <div className="flex gap-3">
            <input
              className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800"
              placeholder="Search products"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800">
              <option value="all">All prices</option>
              <option value="lt50">Under ₹50</option>
              <option value="50-100">₹50 - ₹100</option>
              <option value="gt100">Over ₹100</option>
            </select>
          </div>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProducts;
