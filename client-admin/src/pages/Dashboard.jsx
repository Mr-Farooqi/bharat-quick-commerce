import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  TrendingUp,
  ShoppingBag,
  Store,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Package
} from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  const cards = [
    {
      label: 'Gross Platform Sales',
      value: `₹${stats.totalSales || 0}`,
      sub: 'All time delivered & active GMV',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      badge: '+18.4% this week',
    },
    {
      label: 'Est. Platform Revenue',
      value: `₹${stats.platformRevenue || 0}`,
      sub: 'Net commission earned (~10%)',
      icon: DollarSign,
      color: 'from-amber-500 to-yellow-500',
      badge: 'Platform Margin',
    },
    {
      label: 'Total Platform Orders',
      value: stats.totalOrders || 0,
      sub: 'Processed across all stores',
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Realtime',
    },
    {
      label: 'Pending Shop Approvals',
      value: stats.totalPendingShops || 0,
      sub: 'Vendors awaiting verification',
      icon: Clock,
      color: stats.totalPendingShops > 0 ? 'from-rose-500 to-pink-600' : 'from-slate-700 to-slate-800',
      badge: stats.totalPendingShops > 0 ? 'Action Needed' : 'All Clear',
      action: () => setActiveTab('shops'),
    },
  ];

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      {/* Alert if pending shops */}
      {stats.totalPendingShops > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-900">
                {stats.totalPendingShops} New Merchant Application{stats.totalPendingShops > 1 ? 's' : ''} Pending!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Review store documents and location radius before approving them onto the consumer map.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('shops')}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-colors shadow-sm"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.action}
              className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all ${
                card.action ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{card.sub}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="text-emerald-600">{card.badge}</span>
                {card.action && <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Active Approved Stores</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalApprovedShops || 0} Shops</h4>
            <p className="text-[11px] text-slate-500">Live on customer 10-min grid</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Registered Customers</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalUsers || 0} Users</h4>
            <p className="text-[11px] text-slate-500">Active delivery accounts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Registered Merchants</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalSellers || 0} Sellers</h4>
            <p className="text-[11px] text-slate-500">Partner shop accounts</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Live Platform Orders</h3>
            <p className="text-xs text-slate-500">Real-time status of latest orders placed across all merchant shops</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="w-full sm:w-auto text-center text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-3.5 py-1.5 rounded-xl border border-yellow-200 transition-colors"
          >
            View All Orders →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No orders placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Store</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentOrders.map((ord) => {
                  const statusColors = {
                    placed: 'bg-blue-50 text-blue-700 border-blue-200',
                    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    packing: 'bg-amber-50 text-amber-700 border-amber-200',
                    out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
                    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-800">{ord.customer?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400">{ord.customer?.phone}</div>
                      </td>
                      <td className="py-3.5 text-slate-700 font-semibold">{ord.shop?.name || 'Store'}</td>
                      <td className="py-3.5 text-slate-500 text-xs">{ord.items?.length || 0} items</td>
                      <td className="py-3.5 font-bold text-slate-900">₹{ord.totalAmount}</td>
                      <td className="py-3.5">
                        <span className="text-[11px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                          {ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase border ${statusColors[ord.status] || 'bg-slate-100'}`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
