import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  CheckCircle2,
  Clock,
  Package,
  Bike,
  Sparkles,
  MapPin,
  Store,
  X,
  Phone
} from 'lucide-react';

const steps = [
  { key: 'placed', label: 'Order Placed', desc: 'Received by dark store', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', desc: 'Store accepted order', icon: CheckCircle2 },
  { key: 'packing', label: 'Packing Items', desc: 'Store staff preparing eco-friendly bag', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on the way in 10-15 mins', icon: Bike },
  { key: 'delivered', label: 'Delivered', desc: 'Delivered safely at your door', icon: Sparkles },
];

const OrderTrackingModal = ({ order, onClose }) => {
  const [currentOrder, setCurrentOrder] = useState(order);

  useEffect(() => {
    if (!order?._id) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('joinOrder', order._id);
    });

    socket.on('orderStatusUpdated', (data) => {
      console.log('[Socket.io Customer] Live order status updated:', data);
      setCurrentOrder((prev) => ({
        ...prev,
        status: data.status,
        deliveryPartner: data.deliveryPartner || prev.deliveryPartner,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [order?._id]);

  if (!currentOrder) return null;

  const currentStepIndex = steps.findIndex((s) => s.key === currentOrder.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
            Live Quick-Delivery Tracking
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {currentOrder.orderNumber}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Delivering from <strong className="text-slate-700">{currentOrder.shop?.name || 'Local Dark Store'}</strong>
        </p>

        {/* Live Stepper */}
        <div className="my-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-yellow-400 text-slate-950 ring-4 ring-yellow-400/20 shadow-md animate-pulse'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className={`font-black text-xs ${isCurrent ? 'text-slate-900 text-sm' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {step.label} {isCurrent && '⚡ (In Progress)'}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Info & Items */}
        <div className="space-y-3 text-xs">
          {currentOrder.deliveryPartner && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  🛵
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Assigned Delivery Partner</p>
                  <p className="font-black text-slate-900 text-xs">{currentOrder.deliveryPartner.name}</p>
                </div>
              </div>
              {currentOrder.deliveryPartner.phone && (
                <a
                  href={`tel:${currentOrder.deliveryPartner.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                >
                  Call Rider
                </a>
              )}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Delivery Destination
            </span>
            <p className="font-extrabold text-slate-900">
              {currentOrder.deliveryAddress?.label} • {currentOrder.deliveryAddress?.fullAddress}
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold">
            <span className="text-slate-600">Total Paid ({currentOrder.items?.length} items)</span>
            <span className="text-emerald-700 font-black text-sm">₹{currentOrder.totalAmount}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors"
          >
            Close & Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
