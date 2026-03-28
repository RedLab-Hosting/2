import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotalUSD, cartCount } = useCart();
  const { tenant } = useTenant();

  // Handle navigate to checkout
  const handleCheckout = () => {
    onClose();
    navigate(`/${tenant?.slug || 'default'}/checkout`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-zinc-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white border-b border-zinc-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900 leading-tight">Tu Pedido</h2>
                  <p className="text-xs font-bold text-zinc-400">{cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
              {cartCount === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                  <ShoppingBag size={48} className="text-zinc-300 mb-4" />
                  <p className="text-zinc-500 font-medium">El carrito está vacío</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                          <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-black text-zinc-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                            <button 
                              onClick={() => removeFromCart(item.key)}
                              className="text-zinc-300 hover:text-red-500 transition-colors mt-0.5"
                            >
                              <Trash2 size={16} strokeWidth={2.5}/>
                            </button>
                          </div>
                          
                          {/* Modifiers */}
                          {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {Object.entries(item.selectedModifiers).map(([key, value]) => (
                                <span key={key} className="text-[9px] bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border border-zinc-200">
                                  {key} {value !== '+ $0.00' && value}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Price & Controls */}
                          <div className="flex items-end justify-between mt-3">
                            <span className="font-black text-primary" style={{ color: 'var(--primary-color)' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            
                            <div className="flex items-center bg-zinc-50 rounded-lg p-0.5 border border-zinc-200">
                              <button 
                                onClick={() => updateQuantity(item.key, -1)}
                                className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-white rounded-md transition-all active:scale-95 shadow-xs"
                                style={{ backgroundColor: 'var(--accent-1, transparent)' }}
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="w-8 text-center text-xs font-black text-zinc-900">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.key, 1)}
                                className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-white rounded-md transition-all active:scale-95 shadow-xs"
                                style={{ backgroundColor: 'var(--accent-1, transparent)' }}
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartCount > 0 && (
              <div className="p-6 bg-white border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Total Parcial</span>
                  <span className="font-black text-2xl text-zinc-900">${cartTotalUSD.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 rounded-2xl font-black text-white text-sm flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 group"
                  style={{ backgroundColor: 'var(--secondary-color, var(--primary-color, #ea580c))' }}
                >
                  <span>Ir al Checkout</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={14} strokeWidth={3} />
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
