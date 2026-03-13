import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, exchangeRate = 1 }) => {
  const { addToCart, updateQuantity, getProductQuantity } = useCart();
  const quantityInCart = getProductQuantity(product.id);

  // Price in Bs calculated from USD price and exchange rate
  const priceBs = (product.price * exchangeRate).toLocaleString('es-VE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const handleAddClick = (e) => {
    e.stopPropagation();
    // If product has modifiers, we should open the modal instead.
    // For now, simple add for demo.
    if (product.hasModifiers) {
      // openModal(product); 
      // (This will be implemented in ProductModal)
    } else {
      addToCart(product, null, 1);
    }
  };

  return (
    <motion.div 
      layout
      className="relative flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden group">
        <img 
          src={product.image_url || 'https://via.placeholder.com/400x400?text=Producto'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Price Tag (Glassmorphism) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-white font-bold text-sm">${product.price.toFixed(2)}</span>
          </div>
          <div className="bg-white/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/40">
            <span className="text-zinc-900 dark:text-zinc-100 font-medium text-[10px]">{priceBs} Bs.</span>
          </div>
        </div>

        {/* Quantity Indicator in Image */}
        <AnimatePresence>
          {quantityInCart > 0 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-md"
              style={{ backgroundColor: 'var(--primary-color, #ea580c)' }}
            >
              <span className="text-white font-bold text-sm">{quantityInCart}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-zinc-900 dark:text-white font-bold text-lg mb-1 leading-tight">
          {product.name}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 mb-4">
          {product.description || 'Sin descripción disponible'}
        </p>

        {/* Actions */}
        <div className="mt-auto">
          {quantityInCart === 0 ? (
            <button
              onClick={handleAddClick}
              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-all"
            >
              <Plus size={18} />
              Añadir al carrito
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700">
                <button 
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-zinc-900 dark:text-white">{quantityInCart}</span>
                <button 
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
