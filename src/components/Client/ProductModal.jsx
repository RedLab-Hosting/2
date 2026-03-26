import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';

const ProductModal = ({ product, isOpen, onClose, exchangeRate = 1 }) => {
  const { addToCart } = useCart();
  const { features } = useTenant();
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Reset state when product changes
  React.useEffect(() => {
    setSelectedModifiers({});
    setQuantity(1);
  }, [product, isOpen]);

  if (!product) return null;

  const toggleModifier = (mod) => {
    setSelectedModifiers(prev => {
      const next = { ...prev };
      if (next[mod.name]) {
        delete next[mod.name];
      } else {
        next[mod.name] = `+ $${(mod.extraPrice || 0).toFixed(2)}`;
      }
      return next;
    });
  };

  const getExtrasTotal = () => {
    if (!product.modifiers) return 0;
    return product.modifiers.reduce((sum, mod) => {
      return sum + (selectedModifiers[mod.name] ? (mod.extraPrice || 0) : 0);
    }, 0);
  };

  const unitPriceUSD = product.price + getExtrasTotal();
  const totalUSD = unitPriceUSD * quantity;
  const totalBs = (totalUSD * exchangeRate).toLocaleString('es-VE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const handleAddToCart = () => {
    // Add product to cart with selectedModifiers object (e.g. { "Extra Queso": "+ $1.50" })
    // Ensure the price passed down includes the modifiers, so we clone the product and override price if needed.
    // However, CartContext relies on product.price. Let's pass a modified product.
    const cartProduct = { ...product, price: unitPriceUSD };
    addToCart(cartProduct, selectedModifiers, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col border border-zinc-200"
          >
            {/* Header / Image Area */}
            <div className="relative h-64 sm:h-72 shrink-0">
              <img 
                src={product.image_url || 'https://via.placeholder.com/600x400?text=Producto'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto grow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-zinc-900">{product.name}</h2>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-xl font-bold text-primary" style={{ color: 'var(--primary-color, #ea580c)' }}>
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
                {product.description || 'Disfruta de nuestro delicioso producto preparado con los mejores ingredientes.'}
              </p>

              {/* Modifiers (Flat Array Toggle) */}
              {product.modifiers && product.modifiers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
                    <Plus size={16} className="text-zinc-400" /> Extras Disponibles
                  </h3>
                  <div className="space-y-2">
                    {product.modifiers.map((mod, idx) => {
                      const isSelected = !!selectedModifiers[mod.name];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleModifier(mod)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-primary/5 border-primary' 
                              : 'bg-zinc-50 border-zinc-200 hover:border-primary/50'
                          }`}
                          style={isSelected ? { borderColor: 'var(--primary-color)' } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-zinc-300'
                              }`}
                              style={isSelected ? { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
                            >
                              {isSelected && <svg viewBox="0 0 14 10" fill="none" className="w-3 h-3"><path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span className={`font-bold text-sm ${isSelected ? 'text-zinc-900' : 'text-zinc-600'}`}>
                              {mod.name}
                            </span>
                          </div>
                          <span className="font-black text-sm text-zinc-900">
                            + ${(mod.extraPrice || 0).toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Add to Cart */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div className="flex items-center justify-between w-full sm:w-auto bg-white rounded-xl border border-zinc-200 p-1">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors active:scale-95"
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center font-black text-lg text-zinc-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-between hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  <span>Añadir</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs font-medium mr-2">{totalBs} Bs.</span>
                    <span className="text-lg">${totalUSD.toFixed(2)}</span>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
