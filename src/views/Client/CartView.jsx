import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CartView = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotalUSD, cartCount } = useCart();
  const { tenant } = useTenant();

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 border border-zinc-200">
          <ShoppingBag size={40} className="text-zinc-300" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-zinc-500 mb-8">Agrega productos desde el menú para empezar tu pedido.</p>
        <button 
          onClick={() => navigate(`/${tenant?.slug || 'default'}`)}
          className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all active:scale-95"
        >
          Ir al menú
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black">Mi Carrito</h1>
          <span className="ml-auto text-sm text-zinc-400 font-bold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
        </div>
      </header>

      {/* Cart Items */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div
              key={item.key}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl border border-zinc-200 p-4 flex gap-4"
            >
              {/* Item Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="font-black text-zinc-900 text-sm truncate">{item.name}</h3>
                    {/* Show selected modifiers */}
                    {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.selectedModifiers).map(([key, value]) => (
                          <span key={key} className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold">
                            {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.key)}
                    className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200">
                    <button 
                      onClick={() => updateQuantity(item.key, -1)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-white rounded-lg transition-all active:scale-90"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="w-8 text-center font-black text-sm text-zinc-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.key, 1)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-white rounded-lg transition-all active:scale-90"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right">
                    <span className="font-black text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Bottom Bar — Subtotal + Continue */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-bold text-sm">Subtotal</span>
            <span className="font-black text-xl text-zinc-900">${cartTotalUSD.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate(`/${tenant?.slug || 'default'}/checkout`)}
            className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all"
            style={{ backgroundColor: 'var(--primary-color, #ea580c)' }}
          >
            Continuar con el pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
