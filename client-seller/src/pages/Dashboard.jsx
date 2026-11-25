import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  PackageCheck,
  Truck,
  AlertCircle,
  ChevronRight,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Sparkles,
  Volume2
} from 'lucide-react';

const Dashboard = () => {
  const { shop, refreshShop } = useAuth();
  const { incomingOrder, setIncomingOrder } = useSocket();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const handleToggleDeliveryMode = async () => {
    if (!shop?._id) return;
    const newMode = shop?.deliveryMode === 'self' ? 'delivery_partner' : 'self';
    try {
      await api.put('/seller/shop', { deliveryMode: newMode });
      if (refreshShop) refreshShop();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle delivery mode');
    }
  };

  const fetchOrdersAndStats = async () => {
    try {
      const [orderRes, statRes] = await Promise.all([
        api.get('/seller/orders'),
        api.get('/seller/stats'),
      ]);
      setOrders(orderRes.data.orders || []);
      setStats(statRes.data.stats || {});
    } catch (err) {
      console.error('Failed to fetch seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndStats();
    const interval = setInterval(fetchOrdersAndStats, 6000); // 6s fast polling
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      fetchOrdersAndStats();
      if (incomingOrder && incomingOrder.orderId === orderId) {
        setIncomingOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['placed', 'confirmed', 'packing', 'out_for_delivery'].includes(o.status);
    return o.status === filter;
  });

  if (!shop?.isApproved) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-black">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-amber-950">Store Verification Pending</h3>
          <p className="text-xs text-amber-800 mt-2 leading-relaxed">
            Your shop profile <strong>"{shop?.name}"</strong> has been successfully submitted and is under review by Super Admin.
            Once approved, you will be able to manage inventory and receive 10-minute delivery orders.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-white/80 border border-amber-200 text-left text-xs text-slate-700">
            <p className="font-bold text-slate-900 mb-1">To test immediate approval:</p>
            <p>1. Open the Admin Portal at <a href="http://localhost:3002" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">http://localhost:3002</a></p>
            <p>2. Login with <strong>admin@bharat.com</strong> / <strong>admin1234</strong></p>
            <p>3. Go to "Shop Approvals" and click <strong>"Approve Merchant"</strong>.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Live Order Incoming Modal Alert */}
      {incomingOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-yellow-400 animate-bounce-once">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <h3 className="text-base font-black text-slate-900">🔔 NEW ORDER RECEIVED!</h3>
              </div>
              <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full">
                {incomingOrder.orderNumber}
              </span>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Customer:</span>
                <span className="text-slate-900 font-extrabold">{incomingOrder.customerName}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Total Bill:</span>
                <span className="text-emerald-700 font-black text-sm">₹{incomingOrder.totalAmount}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Items to Pack:</span>
                <span className="text-slate-900 font-bold">{incomingOrder.itemsCount} items</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Delivery Address:</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {incomingOrder.deliveryAddress?.fullAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIncomingOrder(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleUpdateStatus(incomingOrder.orderId, 'packing')}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-md shadow-yellow-400/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Accept & Pack</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">₹{stats?.grossRevenue || 0}</h3>
          <p className="text-xs text-slate-500 mt-1">Total revenue generated</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Net Store Payout</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-2">₹{stats?.netPayout || 0}</h3>
          <p className="text-xs text-slate-500 mt-1">After 10% platform fee</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Orders</span>
          <h3 className="text-2xl font-black text-amber-700 mt-2">{stats?.pendingOrders || 0}</h3>
          <p className="text-xs text-slate-500 mt-1">Requires immediate packing</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stocked Products</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{stats?.totalProducts || 0}</h3>
          <p className="text-xs text-slate-500 mt-1">{stats?.outOfStock || 0} currently out of stock</p>
        </div>
      </div>

      {/* Delivery Mode Quick Controller */}
      <div className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        shop?.deliveryMode === 'self'
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-indigo-50/70 border-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
            shop?.deliveryMode === 'self' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
          }`}>
            {shop?.deliveryMode === 'self' ? '🏪' : '🛵'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Order Delivery Mode:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase ${
                shop?.deliveryMode === 'self' ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-900'
              }`}>
                {shop?.deliveryMode === 'self' ? 'Self Delivery (Store Staff)' : 'Delivery Partner Fleet'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {shop?.deliveryMode === 'self'
                ? 'Your store staff will directly handle pickup and doorstep delivery to the customer.'
                : 'Orders are automatically broadcasted to all active BharatBasket Delivery Partners for instant pickup & delivery.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleDeliveryMode}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-2 ${
            shop?.deliveryMode === 'self'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          <span>Switch to {shop?.deliveryMode === 'self' ? '🛵 Delivery Partner Fleet' : '🏪 Self Delivery'}</span>
        </button>
      </div>

      {/* Order Terminal Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Live Order Fulfillment Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Orders automatically stream in via real-time WebSockets</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['active', 'all', 'packing', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filter === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'active' ? 'Active Orders 🔥' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">No orders in this queue</h4>
            <p className="text-xs text-slate-400 mt-1">Customer orders will appear here in real-time with an audio chime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((ord) => {
              const isUrgent = ord.status === 'placed' || ord.status === 'confirmed';

              return (
                <div
                  key={ord._id}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                    isUrgent ? 'border-amber-300 ring-2 ring-amber-400/30' : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    {/* Order Card Header */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-black text-sm text-slate-900">{ord.orderNumber}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Customer and Address */}
                    <div className="p-4 border-b border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ord.customer?.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{ord.customer?.phone}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        📍 {ord.deliveryAddress?.fullAddress}
                      </p>
                    </div>

                    {/* Delivery Partner Mode & Rider Status */}
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs flex items-center justify-between">
                      <span className="font-extrabold text-[11px] text-slate-600 flex items-center gap-1">
                        {ord.deliveryMode === 'self' ? '🏪 Self Delivery' : '🛵 Partner Fleet'}
                      </span>
                      {ord.deliveryMode === 'delivery_partner' ? (
                        ord.deliveryPartner ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            {ord.deliveryPartner.name} ({ord.deliveryPartner.phone})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                            📡 Waiting for Rider...
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                          Store Staff
                        </span>
                      )}
                    </div>

                    {/* Items checklist */}
                    <div className="p-4 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pack Items ({ord.items?.length})
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {ord.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded bg-white p-0.5" />
                              <div className="truncate">
                                <p className="font-bold text-slate-800 text-[11px] truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400">{item.unit}</p>
                              </div>
                            </div>
                            <span className="font-black text-slate-900 text-xs px-2 py-0.5 bg-yellow-100 rounded-md">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Bill Total</span>
                      <span className="text-sm font-black text-slate-900">₹{ord.totalAmount}</span>
                    </div>

                    {ord.status === 'placed' && (
                      <button
                        disabled={actionLoading === ord._id}
                        onClick={() => handleUpdateStatus(ord._id, 'packing')}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Accept & Pack
                      </button>
                    )}

                    {ord.status === 'confirmed' && (
                      <button
                        disabled={actionLoading === ord._id}
                        onClick={() => handleUpdateStatus(ord._id, 'packing')}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Start Packing
                      </button>
                    )}

                    {ord.status === 'packing' && (
                      ord.deliveryMode === 'delivery_partner' ? (
                        <button
                          disabled={actionLoading === ord._id}
                          onClick={() => handleUpdateStatus(ord._id, 'ready_for_pickup')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Packed (Ready for Pickup)</span>
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading === ord._id}
                          onClick={() => handleUpdateStatus(ord._id, 'out_for_delivery')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch Self</span>
                        </button>
                      )
                    )}

                    {ord.status === 'ready_for_pickup' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                          {ord.deliveryPartner ? '🛵 Rider Arriving' : '📡 Rider Pending'}
                        </span>
                        <button
                          disabled={actionLoading === ord._id}
                          onClick={() => handleUpdateStatus(ord._id, 'out_for_delivery')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-xl transition-all"
                          title="If rider already picked up without clicking"
                        >
                          Handed Over
                        </button>
                      </div>
                    )}

                    {ord.status === 'out_for_delivery' && (
                      <button
                        disabled={actionLoading === ord._id}
                        onClick={() => handleUpdateStatus(ord._id, 'delivered')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </button>
                    )}

                    {ord.status === 'delivered' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
