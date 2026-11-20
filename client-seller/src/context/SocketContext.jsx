import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// Play sound alert using HTML5 Web Audio API (works without any external mp3 files!)
const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(659.25, now, 0.15); // E5
    playTone(880.00, now + 0.18, 0.35); // A5
    playTone(1046.50, now + 0.40, 0.50); // C6
  } catch (err) {
    console.warn('Audio alert error:', err);
  }
};

export const SocketProvider = ({ children }) => {
  const { shop } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingOrder, setIncomingOrder] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log(`[Socket.io Seller] Connected: ${newSocket.id}`);
      if (shop?._id) {
        newSocket.emit('joinShop', shop._id);
      }
    });

    newSocket.on('newOrderPlaced', (orderData) => {
      console.log('[Socket.io Seller] Real-time order received:', orderData);
      setIncomingOrder(orderData);
      playOrderChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [shop?._id]);

  return (
    <SocketContext.Provider value={{ socket, incomingOrder, setIncomingOrder }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
