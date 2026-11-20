import React, { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import CategoryBar from '../components/CategoryBar';
import { useLocation } from '../context/LocationContext';
import { Store, Clock, Sparkles, MapPin, Search } from 'lucide-react';

const Home = ({ search, setSearch }) => {
  const { location } = useLocation();
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch nearby approved shops
  useEffect(() => {
    const fetchShopsAndCategories = async () => {
      try {
        const [shopsRes, catsRes] = await Promise.all([
          api.get(`/customer/shops?lng=${location.coordinates[0]}&lat=${location.coordinates[1]}`),
          api.get('/customer/categories'),
        ]);

        const loadedShops = shopsRes.data.shops || [];
        setShops(loadedShops);
        setCategories(catsRes.data.categories || []);

        if (loadedShops.length > 0) {
          setActiveShop(loadedShops[0]);
        }
      } catch (err) {
        console.error('Failed to load initial storefront data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopsAndCategories();
  }, [location.coordinates]);

  // 2. Fetch products for active shop
  useEffect(() => {
    if (!activeShop?._id) return;

    const fetchShopProducts = async () => {
      setLoading(true);
      try {
        const catQuery = activeCategory !== 'all' ? `?category=${activeCategory}` : '';
        const res = await api.get(`/customer/shops/${activeShop._id}/products${catQuery}`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopProducts();
  }, [activeShop?._id, activeCategory]);

  const filteredProducts = products.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = item.product?.name.toLowerCase().includes(q);
    const brandMatch = item.product?.brand?.toLowerCase().includes(q);
    return nameMatch || brandMatch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Category Bar */}
      <CategoryBar
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Promotional Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-6 md:p-8 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="space-y-2 max-w-lg z-10">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-yellow-300 font-extrabold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Superfast Delivery Promise</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Fresh Daily Groceries, Fruits & Milk in 10-15 Minutes!
            </h2>
            <p className="text-xs font-semibold text-slate-800">
              Sourced directly from certified local dark stores and farmers near you.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10">
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-md text-center">
              <span className="text-3xl font-black text-slate-900 block">10</span>
              <span className="text-[10px] font-extrabold text-slate-600 uppercase">Minutes avg</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-md text-center">
              <span className="text-3xl font-black text-emerald-700 block">0₹</span>
              <span className="text-[10px] font-extrabold text-slate-600 uppercase">Free delivery &gt; ₹199</span>
            </div>
          </div>
        </div>

        {/* Active Dark Store Bar */}
        {activeShop && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">{activeShop.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    ★ {activeShop.rating || '4.8'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {activeShop.address?.street}, {activeShop.address?.city}
                </p>
              </div>
            </div>

            {/* If multiple shops, show selector */}
            {shops.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Change Dark Store:</span>
                <select
                  value={activeShop._id}
                  onChange={(e) => {
                    const chosen = shops.find((s) => s._id === e.target.value);
                    if (chosen) setActiveShop(chosen);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  {shops.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {activeCategory === 'all' ? 'Daily Essentials & Groceries' : activeCategory.replace(/-/g, ' ').toUpperCase()}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {filteredProducts.length} items in stock for instant dispatch
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-sm">No items found matching search</h4>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or select All Categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredProducts.map((item) => (
                <ProductCard key={item._id} item={item} shop={activeShop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
