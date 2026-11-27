import React, { useState } from 'react';
import { Mail, Lock, Phone, User, X, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
      
      // Close login modal
      onClose();

      // Trigger location prompt as requested by user
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="text-center mb-5">
          <img src="/logo.webp" alt="BharatBasket" className="w-14 h-14 rounded-2xl object-contain mx-auto mb-2 shadow-md shadow-orange-400/20" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {isRegister ? 'Join BharatBasket' : 'Welcome to BharatBasket'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Groceries & Daily Essentials delivered in 10-15 minutes
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>
          )}

          <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>You will be prompted to select your 2km delivery address next.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account & Continue' : 'Login & Select Location'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-slate-500">
          {isRegister ? (
            <span>Already have an account? <button onClick={() => setIsRegister(false)} className="text-emerald-700 font-bold hover:underline">Login</button></span>
          ) : (
            <span>New to BharatBasket? <button onClick={() => setIsRegister(true)} className="text-emerald-700 font-bold hover:underline">Sign up</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
