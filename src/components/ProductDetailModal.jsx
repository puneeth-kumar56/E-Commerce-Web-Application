import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export function ProductDetailModal({ product, onClose }) {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const cartItem = items.find((i) => i.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const availableStock = Math.max(0, product.stock - currentInCart);

  const handleAdd = () => {
    if (availableStock <= 0 || quantity > availableStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-slate-950 p-6 flex items-center justify-center relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full max-h-80 md:max-h-full object-cover rounded-xl shadow-lg border border-slate-800"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
            }}
          />
          <div className="absolute top-8 left-8">
            <span className="bg-slate-900/90 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-500/40">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-sm text-amber-400 mb-2">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-semibold text-slate-200">
                {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
              </span>
              <span className="text-slate-500">• (128 customer reviews)</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{product.name}</h2>

            <div className="text-3xl font-extrabold text-indigo-400 mb-4">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {product.description ||
                'Engineered with premium materials designed for long-lasting performance and modern functionality.'}
            </p>

            {/* Inventory Status */}
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 mb-6">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Inventory Status:</span>
                <span
                  className={`font-semibold ${
                    product.stock > 10
                      ? 'text-emerald-400'
                      : product.stock > 0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} units available in MySQL store` : 'Out of stock'}
                </span>
              </div>
              {currentInCart > 0 && (
                <p className="text-[11px] text-slate-400">
                  You already have <span className="text-indigo-300 font-semibold">{currentInCart}</span> of this item in your shopping cart.
                </p>
              )}
            </div>

            {/* Feature Perks */}
            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-800 text-center mb-6">
              <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Free Ship &gt;$75</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-slate-400">Quantity:</span>
              <div className="flex items-center border border-slate-700 rounded-lg bg-slate-800">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || availableStock <= 0}
                  className="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-semibold text-white min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock || availableStock <= 0}
                  className="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={availableStock <= 0}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : availableStock <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.99]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : availableStock <= 0 ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add {quantity} to Cart • ${(Number(product.price) * quantity).toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
