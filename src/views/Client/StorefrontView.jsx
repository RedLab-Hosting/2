import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/Client/ProductCard';
import ProductModal from '../../components/Client/ProductModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu as MenuIcon } from 'lucide-react';

const StorefrontView = () => {
  const navigate = useNavigate();
  const { tenant, productService } = useTenant();
  const { cartCount, cartTotalUSD } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock exchange rate (Will be fetched from exchangeRateService later)
  const exchangeRate = 36.50;

  useEffect(() => {
    // Fetch categories and products for the tenant
    const loadData = async () => {
      try {
        // For now, using mock data if service fails or is empty
        const cats = [
          { id: 'all', name: 'Todos', icon: '🍽️' },
          { id: '1', name: 'Hamburguesas', icon: '🍔' },
          { id: '2', name: 'Pizzas', icon: '🍕' },
          { id: '3', name: 'Bebidas', icon: '🥤' }
        ];
        setCategories(cats);

        const prods = [
          { 
            id: 'p1', 
            name: 'Classic Burger', 
            price: 8.50, 
            description: 'Carne 200g, queso cheddar, lechuga, tomate y salsa especial.',
            category_id: '1',
            hasModifiers: true,
            modifiers: [
              { name: 'Término de la carne', required: true, options: ['Bien cocida', 'Término medio', 'Al punto'] },
              { name: 'Extras', required: false, options: ['Extra Queso', 'Tocineta', 'Huevo'] }
            ]
          },
          { id: 'p2', name: 'Pepperoni Pizza', price: 12.00, description: 'Masa artesanal, salsa pomodoro, mozzarella y mucho pepperoni.', category_id: '2' },
          { id: 'p3', name: 'Coca-Cola', price: 1.50, description: 'Original 355ml bien fría.', category_id: '3' },
          { id: 'p4', name: 'Double Bacon', price: 10.50, description: 'Doble carne, doble tocineta, BBQ.', category_id: '1', hasModifiers: true, modifiers: [{ name: 'Salsas', options: ['Ketchup', 'Mostaza', 'Mayonesa', 'BBQ'] }] }
        ];
        setProducts(prods);
      } catch (err) {
        console.error("Error loading storefront data", err);
      }
    };

    loadData();
  }, [tenant]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-24">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: tenant?.theme?.primaryColor }}>
              {tenant?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{tenant?.name || 'Cargando...'}</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Menu Digital</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Search size={22} />
            </button>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <MenuIcon size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="¿Qué te provoca hoy?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="mb-10 overflow-x-auto no-scrollbar -mx-4 px-4 flex gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-sm ${
                activeCategory === cat.id 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg scale-105' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => handleProductClick(product)}>
                <ProductCard 
                  product={product} 
                  exchangeRate={exchangeRate} 
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
        >
          <button 
            onClick={() => navigate(`/${tenant?.slug || 'default'}/checkout`)}
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 px-6 rounded-2xl flex items-center justify-between shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-zinc-900 dark:border-zinc-100" style={{ backgroundColor: 'var(--primary-color)' }}>
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-bold">Ver Carrito</span>
          </div>
          <div className="text-right">
            <div className="font-bold">${cartTotalUSD.toFixed(2)}</div>
            <div className="text-[10px] opacity-60">{(cartTotalUSD * exchangeRate).toFixed(2)} Bs.</div>
          </div>
        </button>
      </motion.div>
      )}

      {/* Product Detail Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exchangeRate={exchangeRate}
      />
    </div>
  );
};

export default StorefrontView;
