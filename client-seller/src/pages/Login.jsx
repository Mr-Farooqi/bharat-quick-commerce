import React, { useState } from 'react';
import { Store, Lock, Mail, Phone, MapPin, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // login | register

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopStreet, setShopStreet] = useState('');
  const [shopCity, setShopCity] = useState('Delhi');
  const [shopPincode, setShopPincode] = useState('110001');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register({
        name,
        email: regEmail,
        password: regPassword,
        phone,
        shopName,
        shopAddress: {
          street: shopStreet,
          city: shopCity,
          state: 'Delhi',
          pincode: shopPincode,
        },
        shopPhone: phone,
      });
      setSuccessMsg(res.message);
      setTab('login');
      setEmail(regEmail);
      setPassword(regPassword);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFillApproved = () => {
    setTab('login');
    setEmail('seller@bharat.com');
    setPassword('seller1234');
    setError('');
  };

  const handleDemoFillPending = () => {
    setTab('login');
    setEmail('newvendor@bharat.com');
    setPassword('vendor1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white font-black text-3xl shadow-xl shadow-emerald-500/20 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            bharat<span className="text-emerald-400">.</span>
            <span className="text-slate-400 font-normal text-sm ml-2 px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800">
              Merchant Hub
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">
            Partner Store Operations, Real-Time POS & Fulfillment
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-800 p-1 rounded-2xl mb-6 border border-slate-700">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'login' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Merchant Login
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'register' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register New Shop
          </button>
        </div>

        <div className="bg-slate-850 bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Merchant Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@bharat.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Enter Merchant Terminal'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo quick fills */}
              <div className="pt-6 border-t border-slate-700/80 space-y-2">
                <button
                  type="button"
                  onClick={handleDemoFillApproved}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Autofill Approved Store (Ramesh Groceries)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoFillPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Autofill Pending Verification Store</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="shop@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  minlength="6"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-700">
                <label className="block text-[11px] font-bold text-emerald-400 uppercase mb-1">Store / Shop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Supermart & Dairy"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Shop No. 12, Main Bazaar"
                  value={shopStreet}
                  onChange={(e) => setShopStreet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={shopPincode}
                    onChange={(e) => setShopPincode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-all disabled:opacity-50 mt-3"
              >
                {loading ? 'Submitting Application...' : 'Submit Shop Onboarding'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
