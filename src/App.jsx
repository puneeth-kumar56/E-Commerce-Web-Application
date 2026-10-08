/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProductCard } from './components/ProductCard.jsx';
import { ProductDetailModal } from './components/ProductDetailModal.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { CheckoutModal } from './components/CheckoutModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { OrderHistoryView } from './components/OrderHistoryView.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { SetupGuideModal } from './components/SetupGuideModal.jsx';
import { api } from './services/api.js';
import {
  Sparkles,
  Database,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

function MainShop() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('catalog');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.products.getAll({
          category: selectedCategory,
          search: searchQuery,
          sortBy: sortBy !== 'default' ? sortBy : undefined,
        }),
        api.products.getCategories(),
      ]);

      if (prodsRes.success) setProducts(prodsRes.products);
      if (catsRes.success) setCategories(['All', ...catsRes.categories]);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, sortBy, searchQuery]);

  const handleCheckoutSuccess = (orderId) => {
    setHighlightOrderId(orderId);
    setCurrentView('orders');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <div>
            {/* Hero Banner Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Production Full-Stack Architecture • JavaScript (ES6+), MySQL & Express</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    Engineered E-Commerce with{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                      ACID Transactions
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
                    Explore a complete full-stack platform featuring JWT authentication, role-based access control (RBAC), atomic inventory locking on checkout, and live order tracking.
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button
                      onClick={() => setIsGuideModalOpen(true)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                    >
                      <Database className="w-4 h-4" />
                      View schema.sql & Setup Guide
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Browse Catalog ({products.length})
                    </button>
                  </div>
                </div>

                {/* Architecture Highlights Pill Box */}
                <div className="w-full md:w-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl max-w-sm shrink-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Key Implementations
                  </span>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Role-Based Access Control (User vs Admin)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>InnoDB Transactions: Atomic stock deduction</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>JWT Authentication with bcryptjs hashing</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Fulfillment tracking with status pipeline</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Filter & Controls */}
            <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="default">Featured / Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Product Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading && products.length === 0 ? (
                <div className="py-24 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                  <p className="text-xs text-slate-400">Loading catalog from database...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-semibold text-white">No products found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No products matched "{searchQuery}". Try searching for other keywords or reset your category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'orders' && (
          <OrderHistoryView
            onBackToShop={() => setCurrentView('catalog')}
            highlightOrderId={highlightOrderId}
          />
        )}

        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer onCheckout={() => setIsCheckoutModalOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccess={handleCheckoutSuccess}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SetupGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>NovaMart E-Commerce Platform • Built with React, Node.js Express, & MySQL (ES6+ JavaScript)</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              schema.sql Script
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              API Reference
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainShop />
      </CartProvider>
    </AuthProvider>
  );
}
