import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingBag, Search, Clock, CheckCircle, Package, MapPin, Phone, Eye } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // 8s polling for live orders
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shop?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusColors = {
    placed: 'bg-blue-50 text-blue-700 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    packing: 'bg-amber-50 text-amber-700 border-amber-200',
    out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Header, Filter and Search */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Platform Orders Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time quick-commerce orders across all dark stores</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, user, shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
              filter === st
                ? 'bg-slate-900 text-yellow-400 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-sm">No orders matching criteria</h4>
          <p className="text-xs text-slate-400 mt-1">Orders placed by customers will stream live here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Merchant Store</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-extrabold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customer?.name}</div>
                      <div className="text-[10px] text-slate-400">{ord.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{ord.shop?.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-bold">{ord.items?.length || 0} items</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">₹{ord.totalAmount}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-slate-100 text-slate-700">
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${statusColors[ord.status] || 'bg-slate-100'}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Order Details</span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${statusColors[selectedOrder.status]}`}>
                {selectedOrder.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-2">Delivery Destination</h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-900">{selectedOrder.deliveryAddress?.label} • {selectedOrder.customer?.name}</p>
                  <p className="text-slate-600 mt-0.5">{selectedOrder.deliveryAddress?.fullAddress}</p>
                  <p className="text-slate-500 mt-1">Phone: {selectedOrder.deliveryAddress?.contactPhone || selectedOrder.customer?.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px] mb-2">Ordered Items ({selectedOrder.items?.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt={it.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{it.name}</p>
                          <p className="text-[10px] text-slate-400">{it.unit} • Qty: {it.quantity}</p>
                        </div>
                      </div>
                      <div className="font-black text-slate-900">
                        ₹{it.price * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-black text-sm text-slate-900">
                <span>Total Bill Amount</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
