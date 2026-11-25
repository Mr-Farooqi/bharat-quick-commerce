import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// HTML5 Web Audio chime 🔔
const playDeliveryAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.2);        // C5
    playTone(659.25, now + 0.15, 0.2); // E5
    playTone(783.99, now + 0.3, 0.4);  // G5
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [claimedOrderId, setClaimedOrderId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'delivery_partner') return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('[Socket.io Rider] Connected to gateway:', s.id);
      s.emit('joinDeliveryPartner');
    });

    // Realtime broadcast from seller or customer order
    s.on('newDeliveryAvailable', (data) => {
      console.log('[Socket.io Rider] ⚡ NEW DELIVERY BROADCAST:', data);
      playDeliveryAlertSound();
      setNewOrderAlert(data);
    });

    // When another rider claims an order, remove it
    s.on('deliveryOrderClaimed', (data) => {
      console.log('[Socket.io Rider] Order claimed by another rider:', data);
      setClaimedOrderId(data.orderId);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, newOrderAlert, setNewOrderAlert, claimedOrderId, playDeliveryAlertSound }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
