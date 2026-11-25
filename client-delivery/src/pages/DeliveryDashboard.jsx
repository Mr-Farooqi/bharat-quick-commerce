import React, { useState, useEffect } from 'react';
import {
  Bike,
  PackageCheck,
  MapPin,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  Radio,
  CheckCircle,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { newOrderAlert, setNewOrderAlert, claimedOrderId } = useSocket();

  const [activeTab, setActiveTab] = useState('active'); // active, available, history
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [historyData, setHistoryData] = useState({ totalDeliveries: 0, totalEarnings: 0, todayDeliveries: 0, todayEarnings: 0, orders: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch available orders, active order, and history
  const fetchData = async () => {
    try {
      const [availRes, activeRes, histRes] = await Promise.all([
        api.get('/delivery/available'),
        api.get('/delivery/active'),
        api.get('/delivery/history'),
      ]);

      if (availRes.data.success) {
        setAvailableOrders(availRes.data.orders);
      }
      if (activeRes.data.success) {
        setActiveOrder(activeRes.data.order);
        // If there's an ongoing active order, default to active tab
        if (activeRes.data.order && activeTab === 'available') {
          setActiveTab('active');
        }
      }
      if (histRes.data.success) {
        setHistoryData(histRes.data);
      }
    } catch (err) {
      console.error('Failed to sync delivery dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5-second fast polling
    return () => clearInterval(interval);
  }, []);

  // Real-time socket triggers
  useEffect(() => {
    if (newOrderAlert) {
      fetchData();
    }
  }, [newOrderAlert]);

  useEffect(() => {
    if (claimedOrderId) {
      setAvailableOrders((prev) => prev.filter((o) => o._id !== claimedOrderId));
    }
  }, [claimedOrderId]);

  // Handle rider accepting an order
  const handleAcceptOrder = async (orderId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/delivery/orders/${orderId}/accept`);
      if (res.data.success) {
        setActiveOrder(res.data.order);
        setActiveTab('active');
        setNewOrderAlert(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order.');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle confirming pickup from store
  const handlePickup = async (orderId) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/delivery/orders/${orderId}/pickup`);
      if (res.data.success) {
        setActiveOrder(res.data.order);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm pickup.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle confirming delivery to customer
  const handleDeliver = async (orderId) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/delivery/orders/${orderId}/deliver`);
      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setActiveOrder(null);
        setActiveTab('history');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete delivery.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Duty Offline Notice */}
      {!user?.isOnline && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-amber-300">You are currently OFFLINE</h4>
              <p className="text-[11px] text-amber-200/80">Turn duty online using the top switch to receive nearby delivery trip broadcasts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Realtime Alert Banner */}
      {newOrderAlert && !activeOrder && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce-once">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">⚡ New Delivery Request Available Nearby!</p>
              <p className="text-xs text-white font-bold mt-0.5">
                {newOrderAlert.shopName} ➔ {newOrderAlert.deliveryAddress?.fullAddress}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setNewOrderAlert(null)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Dismiss
            </button>
            <button
              onClick={() => handleAcceptOrder(newOrderAlert.orderId)}
              disabled={actionLoading}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/30"
            >
              Accept Trip (₹{newOrderAlert.payout})
            </button>
          </div>
        </div>
      )}

      {/* Quick KPI Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Earnings</span>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">₹{historyData.todayEarnings}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{historyData.todayDeliveries} trips today</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payout</span>
          <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mt-1">₹{historyData.totalEarnings}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{historyData.totalDeliveries} total deliveries</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Mission</span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            {activeOrder ? '1 Trip 🛵' : 'Idle 💤'}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
            {activeOrder ? activeOrder.status.replace(/_/g, ' ') : 'Ready for next order'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Queue</span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{availableOrders.length} Trips</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Live broadcasts</p>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'active'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🛵 Active Trip</span>
          {activeOrder && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-emerald-400">
              1
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'available'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>⚡ Available Queue</span>
          {availableOrders.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300">
              {availableOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>💰 Earnings & Log</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. ACTIVE ORDER */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {!activeOrder ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
              <Bike className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active delivery in progress</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Check the <strong>Available Queue</strong> tab to accept incoming orders from BharatBasket partner stores!
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
              >
                View Available Trips ({availableOrders.length})
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      ONGOING DELIVERY MISSION
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-0.5">{activeOrder.orderNumber}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Trip Payout</span>
                    <span className="text-lg font-black text-emerald-400">₹{activeOrder.deliveryPartnerPayout || 45}</span>
                  </div>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="py-6 grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border transition-all ${
                  activeOrder.status === 'out_for_delivery'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                }`}>
                  <div className="flex items-center gap-2 font-black text-xs">
                    {activeOrder.status === 'out_for_delivery' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4" />}
                    <span>Step 1: Store Pickup</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {activeOrder.status === 'out_for_delivery' ? 'Package collected from store' : 'Head to shop to receive packaged items'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  activeOrder.status === 'out_for_delivery'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Truck className="w-4 h-4" />
                    <span>Step 2: Customer Doorstep</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {activeOrder.status === 'out_for_delivery' ? 'Navigate to customer & hand over' : 'Awaiting store pickup confirmation'}
                  </p>
                </div>
              </div>

              {/* TWO SIDES: STORE PICKUP & CUSTOMER DELIVERY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
                {/* Store Pickup Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <span>🏪</span> PICKUP LOCATION (SELLER)
                    </span>
                    {activeOrder.status === 'out_for_delivery' && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Picked Up ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white">{activeOrder.shop?.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {activeOrder.shop?.address?.street}, {activeOrder.shop?.address?.city} ({activeOrder.shop?.address?.pincode})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {activeOrder.shop?.phone && (
                      <a
                        href={`tel:${activeOrder.shop.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Call Store</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeOrder.shop?.name} ${activeOrder.shop?.address?.street} ${activeOrder.shop?.address?.city}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Maps Route</span>
                    </a>
                  </div>
                </div>

                {/* Customer Drop Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                      <span>📍</span> DROP LOCATION (CUSTOMER)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeOrder.paymentMethod === 'ONLINE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {activeOrder.paymentMethod === 'ONLINE' ? 'PAID ONLINE ✓' : `COD: COLLECT ₹${activeOrder.totalAmount}`}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white">{activeOrder.customer?.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {activeOrder.deliveryAddress?.fullAddress} ({activeOrder.deliveryAddress?.city})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {activeOrder.deliveryAddress?.contactPhone && (
                      <a
                        href={`tel:${activeOrder.deliveryAddress.contactPhone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call Customer</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeOrder.deliveryAddress?.fullAddress} ${activeOrder.deliveryAddress?.city}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Maps Route</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Items checklist */}
              <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-3">
                  Items inside package ({activeOrder.items?.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {activeOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate pr-2">{it.name}</span>
                      <span className="font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md">
                        x{it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                {activeOrder.status !== 'out_for_delivery' ? (
                  <button
                    onClick={() => handlePickup(activeOrder._id)}
                    disabled={actionLoading}
                    className="flex-1 py-3.5 sm:py-4 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-yellow-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PackageCheck className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">CONFIRM STORE PICKUP (I HAVE THE PACKAGE) 📦</span>
                    <span className="sm:hidden">CONFIRM STORE PICKUP 📦</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeliver(activeOrder._id)}
                    disabled={actionLoading}
                    className="flex-1 py-3.5 sm:py-4 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">CONFIRM DELIVERY (HANDED OVER TO CUSTOMER) ✅</span>
                    <span className="sm:hidden">CONFIRM DELIVERY ✅</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. AVAILABLE QUEUE */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Available Trips for Pickup</h3>
              <p className="text-xs text-slate-400">Accept an order to claim it before other nearby delivery partners.</p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Refresh
            </button>
          </div>

          {availableOrders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">No available pickup orders right now</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Orders with "Delivery Partner" mode will appear here in real-time as customers place them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4 shadow-lg"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="font-black text-sm text-white">{ord.orderNumber}</span>
                        <span className="ml-2 text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                          Earn ₹{ord.deliveryPartnerPayout || 45}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="py-3 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">🏪 Pickup:</span>
                        <div>
                          <p className="font-extrabold text-white">{ord.shop?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {ord.shop?.address?.street}, {ord.shop?.address?.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">📍 Drop:</span>
                        <div>
                          <p className="font-extrabold text-white">{ord.customer?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {ord.deliveryAddress?.fullAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {ord.items?.length || 0} items inside
                    </span>

                    <button
                      onClick={() => handleAcceptOrder(ord._id)}
                      disabled={actionLoading || !!activeOrder}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                        activeOrder
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>{activeOrder ? 'Trip In Progress' : 'ACCEPT TRIP ⚡'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. EARNINGS & HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-white">Completed Trips & Payout Summary</h3>

          {historyData.orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">No completed trips yet</h4>
              <p className="text-xs text-slate-400 mt-1">Accept and deliver your first BharatBasket order to see earnings logged here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyData.orders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-black">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(ord.deliveredAt || ord.updatedAt).toLocaleDateString()} at{' '}
                          {new Date(ord.deliveredAt || ord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ord.shop?.name} ➔ {ord.customer?.name} ({ord.deliveryAddress?.city})
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                    <span className="text-sm font-black text-emerald-400">
                      +₹{ord.deliveryPartnerPayout || 45}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {ord.paymentMethod === 'ONLINE' ? 'Online Paid' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
