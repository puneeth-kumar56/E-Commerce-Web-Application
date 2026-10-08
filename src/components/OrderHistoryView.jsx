import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, XCircle, ArrowLeft, RefreshCw, MapPin, CreditCard } from 'lucide-react';
import { api } from '../services/api.js';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export function OrderHistoryView({
  onBackToShop,
  highlightOrderId,
}) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.orders.getMyOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load order history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store Catalog
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            My Order History & Live Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status updates synced with the relational MySQL database.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Tracking
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {isLoading && orders.length === 0 ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          <p className="text-sm">Fetching your orders from the database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/60 rounded-2xl border border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Orders Found Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any orders yet. Add items to your cart and execute checkout to see live transaction tracking here!
          </p>
          <button
            onClick={onBackToShop}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
          >
            Explore Product Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = getStatusStepIndex(order.status);
            const isHighlighted = highlightOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-slate-900/90 rounded-2xl border overflow-hidden transition-all shadow-md ${
                  isHighlighted
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-slate-850/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-white text-sm">
                      Order #{order.id}
                    </span>
                    <span className="text-slate-400">
                      Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-base font-extrabold text-white">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-4">
                    Fulfillment Progress:
                  </span>

                  {order.status === 'Cancelled' ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>This order was cancelled. Inventory was automatically preserved.</span>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Progress Bar Background */}
                      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-800 z-0 mx-6 sm:mx-10" />
                      <div
                        className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-indigo-500 z-0 mx-6 sm:mx-10 transition-all duration-500"
                        style={{
                          width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />

                      {/* Steps */}
                      <div className="relative z-10 flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= stepIndex;
                          const isCurrent = idx === stepIndex;

                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                                  isDone
                                    ? isCurrent
                                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110'
                                      : 'bg-indigo-900 text-indigo-200 border border-indigo-700'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                {isDone ? (
                                  idx === 3 ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    idx + 1
                                  )
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-medium mt-2 ${
                                  isCurrent
                                    ? 'text-indigo-400 font-bold'
                                    : isDone
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items & Shipping Details */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Items Column */}
                  <div className="md:col-span-2 space-y-3">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Ordered Products ({order.items?.length || 0})
                    </span>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850/60 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-700/60 shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-200 truncate">
                                {item.product_name || `Product #${item.product_id}`}
                              </p>
                              <p className="text-slate-400 text-[11px]">
                                Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-white ml-2">
                            ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata Column */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <span className="font-semibold text-slate-400 block uppercase tracking-wider">
                      Delivery Details
                    </span>

                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">Destination:</span>
                        <span className="leading-snug">{order.shipping_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300 pt-2 border-t border-slate-800/80">
                      <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">Payment:</span>
                        <span>{order.payment_method}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Database Record:</span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        orders.id = {order.id} • InnoDB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
