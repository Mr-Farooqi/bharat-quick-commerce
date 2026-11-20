import React from 'react';
import { Bell, Sparkles, ExternalLink } from 'lucide-react';

const Navbar = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick link badges to other portals */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
          >
            <span>Seller Hub (:3001)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100 transition-colors"
          >
            <span>Customer App (:3000)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Central API Live (:5000)</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
