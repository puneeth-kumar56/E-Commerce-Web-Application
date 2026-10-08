import React, { useState } from 'react';
import { ShoppingBag, Search, User as UserIcon, Shield, Package, BookOpen, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenGuide,
}) {
  const { user, logout, demoLogin } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('catalog')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Nova<span className="text-indigo-400">Mart</span>
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono font-medium -mt-1">
                  Full-Stack E-Com
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('catalog')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'catalog'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Storefront
              </button>

              {user && (
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'orders'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  My Orders
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-indigo-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Admin Panel
                </button>
              )}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Setup & SQL Docs Button */}
            <button
              onClick={onOpenGuide}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View Setup Guide, schema.sql and API Reference"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Setup & Schema Docs</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm focus:outline-none transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                        Admin
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 text-sm text-slate-200 z-50">
                      <div className="px-3 py-2 border-b border-slate-700/80">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <p className="text-[11px] text-indigo-400 capitalize mt-0.5">Role: {user.role}</p>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentView('orders');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700/70 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Order History
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-700/70 flex items-center gap-2 text-indigo-300 cursor-pointer"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </button>
                      )}

                      <div className="border-t border-slate-700/80 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-950/40 text-rose-300 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    onClick={() => demoLogin('admin')}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    title="Quick demo access as Administrator"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Demo Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
