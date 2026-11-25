import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Percent,
  Search,
  Check,
  ShieldAlert,
  Sliders
} from 'lucide-react';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchShops = async () => {
    try {
      const url = filter === 'all' ? '/admin/shops' : `/admin/shops?status=${filter}`;
      const res = await api.get(url);
      setShops(res.data.shops || []);
    } catch (err) {
      console.error('Failed to load shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [filter]);

  const handleUpdateStatus = async (shopId, isApproved) => {
    setUpdatingId(shopId);
    try {
      await api.put(`/admin/shops/${shopId}`, { isApproved });
      fetchShops();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shop status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCommissionChange = async (shopId, currentVal) => {
    const newVal = prompt('Enter platform commission percentage (e.g. 10 for 10%):', currentVal || 10);
    if (newVal === null) return;
    const num = parseFloat(newVal);
    if (isNaN(num) || num < 0 || num > 50) {
      alert('Please enter a valid percentage between 0 and 50');
      return;
    }

    try {
      await api.put(`/admin/shops/${shopId}`, { commissionPercent: num });
      fetchShops();
    } catch (err) {
      alert('Failed to update commission');
    }
  };

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(search.toLowerCase()) ||
    shop.address?.city?.toLowerCase().includes(search.toLowerCase()) ||
    shop.owner?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Top Filter and Search bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['all', 'pending', 'approved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'pending' ? 'Pending Approval ⏳' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search store name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      {/* Shops Grid */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-sm">No shops found matching filter</h4>
          <p className="text-xs text-slate-400 mt-1">Try switching tabs or searching another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredShops.map((shop) => (
            <div
              key={shop._id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Shop Banner Header */}
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  <img
                    src={shop.bannerImage}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {shop.isApproved ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Approved & Live
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Shop Info */}
                <div className="p-6">
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{shop.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{shop.description}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{shop.address?.street}, {shop.address?.city} ({shop.address?.pincode})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Owner: {shop.owner?.name} ({shop.owner?.email})</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Commission:</span>
                      <span className="ml-1.5 font-extrabold text-slate-900">{shop.commissionPercent || 10}%</span>
                    </div>
                    <button
                      onClick={() => handleCommissionChange(shop._id, shop.commissionPercent)}
                      className="text-[11px] text-yellow-600 font-bold hover:underline"
                    >
                      Edit %
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                {!shop.isApproved ? (
                  <button
                    disabled={updatingId === shop._id}
                    onClick={() => handleUpdateStatus(shop._id, true)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Merchant</span>
                  </button>
                ) : (
                  <button
                    disabled={updatingId === shop._id}
                    onClick={() => handleUpdateStatus(shop._id, false)}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Suspend / Revoke</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shops;
