import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, DollarSign, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
}) {
  const { items, grandTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [stateCode, setStateCode] = useState('IL');
  const [zip, setZip] = useState('62704');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('You must be signed in to complete checkout.');
      return;
    }

    if (!address.trim() || !city.trim() || !zip.trim()) {
      setErrorMessage('Please fill out all address fields.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${address.trim()}, ${city.trim()}, ${stateCode.trim()} ${zip.trim()}`;
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        shippingAddress: fullAddress,
        paymentMethod,
      };

      const res = await api.orders.checkout(payload);

      if (res.success && res.order) {
        clearCart();
        setCompletedOrder({
          orderId: res.order.orderId,
          totalAmount: res.order.totalAmount,
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Transaction failed. Please check stock availability and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              {completedOrder ? 'Order Confirmed!' : 'Secure Transaction Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedOrder ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-700/80 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Thank You for Your Order!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your order has been recorded in MySQL with transaction isolation and stock levels have been automatically updated.
              </p>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-indigo-400">#{completedOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Charged:</span>
                  <span className="font-bold text-white">${completedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Initial Status:</span>
                  <span className="bg-amber-950 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-800">
                    Pending
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Transaction:</span>
                  <span className="text-emerald-400 font-mono">COMMITTED</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    onSuccess(completedOrder.orderId);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  View Order in History
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !user ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-700/80 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-white">Sign In Required to Checkout</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Please log into your user account or use our instant demo login to execute this transaction.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Info Badge */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">Logged In As:</span>
                  <span className="font-semibold text-white">{user.name} ({user.email})</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                  Role: {user.role}
                </span>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Shipping Address
                </label>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    required
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit Card')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      paymentMethod === 'Credit Card'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Credit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Stripe')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      paymentMethod === 'Stripe'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    Stripe Flow
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    COD (Cash)
                  </button>
                </div>
              </div>

              {/* Items Summary Preview */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>{items.reduce((s, i) => s + i.quantity, 0)} Items in Transaction</span>
                  <span className="font-mono text-slate-200">${grandTotal.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Transactions execute using atomic MySQL commit/rollback with stock deduction.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing DB Transaction...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Place Order (${grandTotal.toFixed(2)})
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
