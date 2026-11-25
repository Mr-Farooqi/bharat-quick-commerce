import React, { useState } from 'react';
import { Bike, KeyRound, Mail, Lock, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = () => {
    setIsRegister(false);
    setEmail('rider@bharatbasket.com');
    setPassword('rider1234');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          phone,
          vehicleNumber,
          vehicleType: 'EV Bike',
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img src="/logo.webp" alt="BharatBasket" className="w-16 h-16 rounded-2xl object-contain mx-auto mb-3 shadow-xl shadow-orange-500/20" />
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            Bharat<span className="text-emerald-400 font-black">Basket</span>
            <span className="text-slate-400 font-normal text-xs ml-2 px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-900">
              Rider Partner
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">
            Hyperlocal Delivery Partner Operations & Fast Payout Terminal
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 p-1 rounded-2xl mb-5 border border-slate-800">
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isRegister ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rider Login
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isRegister ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Join Fleet
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Vikram Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Vehicle Number / Model
                  </label>
                  <div className="relative">
                    <Bike className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="DL-01-BB-2026 (EV Bike)"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="rider@bharatbasket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Register as Delivery Partner' : 'Login to Rider Terminal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Rider Login Button */}
          <div className="mt-5 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-yellow-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-yellow-400" />
              <span>Autofill Demo Rider (Vikram Rider)</span>
            </button>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-6 flex items-center justify-around text-center text-[11px] text-slate-500">
          <div>
            <p className="font-bold text-slate-300">⚡ ₹45 - ₹65</p>
            <p>Per Delivery Payout</p>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <p className="font-bold text-slate-300">🔔 Real-Time</p>
            <p>Pickup Broadcasts</p>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <p className="font-bold text-slate-300">⏱️ Instant</p>
            <p>Online Duty Toggle</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
