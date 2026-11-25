import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingBag, ArrowLeft, Clock, Eye, Sparkles } from 'lucide-react';

const MyOrders = ({ onBack, onTrackOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/customer/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColors = {
    placed: 'bg-blue-50 text-blue-700 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    packing: 'bg-amber-50 text-amber-700 border-amber-200',
    out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Orders</h2>
          <p className="text-xs text-slate-500">View real-time delivery status and previous grocery orders</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-sm">No orders yet</h4>
          <p className="text-xs text-slate-400 mt-1">Start shopping to get fast delivery in 10-15 minutes!</p>
          <button
            onClick={onBack}
            className="mt-5 px-5 py-2.5 bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase border ${statusColors[ord.status]}`}>
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Bill</span>
                    <span className="font-black text-slate-900 text-sm">₹{ord.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => onTrackOrder(ord)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </button>
                </div>
              </div>

              {/* Items row */}
              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto max-w-xl">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                      <span className="font-bold text-slate-800 text-[11px] max-w-[120px] truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Store: <strong className="text-slate-800">{ord.shop?.name}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
