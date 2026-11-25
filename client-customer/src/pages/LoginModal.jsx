import React, { useState } from 'react';
import { Mail, Lock, Phone, User, X, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
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
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setEmail('customer@bharat.com');
    setPassword('customer1234');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-orange-400/20">
            B
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {isRegister ? 'Join BharatBasket' : 'Welcome to BharatBasket'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            BharatBasket's last minute app • Groceries in 10 minutes
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
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-400"
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
                placeholder="customer@bharat.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-400"
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
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-400"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Auto-fill button */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-yellow-600" />
            <span>Autofill Demo Customer Login</span>
          </button>
        </div>

        <div className="text-center mt-3 text-xs text-slate-500">
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
