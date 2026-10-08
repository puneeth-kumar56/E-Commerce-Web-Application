import React, { useState } from 'react';
import { Star, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export function ProductCard({ product, onSelect }) {
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxReached = currentInCart >= product.stock;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxReached) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-slate-900/85 backdrop-blur-md text-slate-300 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-700/60 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {product.stock <= 0 ? (
            <span className="bg-rose-950/90 text-rose-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-rose-800/80 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="bg-amber-950/90 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-800/80">
              Only {product.stock} Left!
            </span>
          ) : (
            <span className="bg-emerald-950/90 text-emerald-300 text-[11px] font-medium px-2 py-0.5 rounded-md border border-emerald-800/80">
              {product.stock} in stock
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-semibold text-slate-300">
              {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
            </span>
            <span className="text-slate-500">• Verified</span>
          </div>

          <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {product.description || 'Premium engineered craftsmanship tailored for everyday utility and durability.'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-normal">Price</span>
            <span className="text-lg font-bold text-white tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isMaxReached}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock || isMaxReached
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-sm'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : isMaxReached ? (
              'Max in Cart'
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
