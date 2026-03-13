import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Plus, Package, Clock, DollarSign, Settings, RefreshCw, BarChart3, ChevronRight, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { exchangeRateService } from '../../api/exchangeRateService';

const AdminDashboardView = () => {
  const { tenant, productService } = useTenant();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [exchangeRate, setExchangeRate] = useState({ rate: 36.50, mode: 'auto' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      loadAdminData();
    }
  }, [tenant]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Mock loading data
      const rate = await exchangeRateService.getRate(tenant.id);
      if (rate) setExchangeRate(rate);

      // Mock products
      setProducts([
        { id: 'p1', name: 'Classic Burger', price: 8.50, is_available: true, image_url: '' },
        { id: 'p2', name: 'Pepperoni Pizza', price: 12.00, is_available: true, image_url: '' },
        { id: 'p3', name: 'Coca-Cola', price: 1.50, is_available: false, image_url: '' },
      ]);
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRate = async () => {
    const newRate = await exchangeRateService.syncRate(tenant.id);
    setExchangeRate(newRate);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg" style={{ backgroundColor: 'var(--primary-color)' }} />
          <h2 className="font-bold text-zinc-900 dark:text-white">Admin Panel</h2>
        </div>
        
        <nav className="space-y-2">
          {[
            { id: 'pedidos', label: 'Pedidos', icon: Clock },
            { id: 'productos', label: 'Productos', icon: Package },
            { id: 'config', label: 'Configuración', icon: Settings },
            { id: 'reportes', label: 'Reportes', icon: BarChart3 }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' 
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {item.id === 'pedidos' && <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>3</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'pedidos' && (
          <div>
            <header className="mb-8">
              <h1 className="text-2xl font-bold dark:text-white">Pedidos en Tiempo Real</h1>
              <p className="text-zinc-500">Gestiona las órdenes activas de tu local</p>
            </header>
            
            <div className="space-y-4">
              {/* Mock Order List */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-primary transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-400">#01</div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">Juan Pérez</h3>
                    <p className="text-xs text-zinc-500">2 productos • Hace 5 min • <b>Delivery</b></p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-zinc-900 dark:text-white">$15.50</div>
                    <div className="text-[10px] text-zinc-500">565.75 Bs.</div>
                  </div>
                  <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase">
                    Pendiente
                  </div>
                  <ChevronRight size={20} className="text-zinc-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'productos' && (
          <div>
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Menú y Productos</h1>
                <p className="text-zinc-500">Añade o edita lo que ofreces a tus clientes</p>
              </div>
              <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
                <Plus size={20} /> Nuevo Producto
              </button>
            </header>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-5 text-zinc-500 font-bold text-xs uppercase tracking-wider">Producto</th>
                    <th className="p-5 text-zinc-500 font-bold text-xs uppercase tracking-wider">Categoría</th>
                    <th className="p-5 text-zinc-500 font-bold text-xs uppercase tracking-wider">Precio ($)</th>
                    <th className="p-5 text-zinc-500 font-bold text-xs uppercase tracking-wider">Estado</th>
                    <th className="p-5 text-zinc-500 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">IMG</div>}
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-zinc-500 font-medium">Hamburguesas</td>
                      <td className="p-5 font-bold text-zinc-900 dark:text-white">${p.price.toFixed(2)}</td>
                      <td className="p-5">
                        <button className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${p.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.is_available ? <Eye size={12} /> : <EyeOff size={12} />}
                          {p.is_available ? 'Disponible' : 'Agotado'}
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Edit2 size={18} /></button>
                          <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-2xl">
            <header className="mb-10">
              <h1 className="text-2xl font-bold dark:text-white">Configuración del Local</h1>
              <p className="text-zinc-500">Personaliza la experiencia y finanzas</p>
            </header>

            <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="text-green-500" /> Tasa de Cambio (BCV)
                </h3>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white">{exchangeRate.rate.toFixed(2)} <span className="text-xs font-bold text-zinc-400 uppercase">Bs.</span></div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Última actualización: Hoy, 4:00 PM</div>
                  </div>
                  <button 
                    onClick={handleSyncRate}
                    className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-primary hover:rotate-180 transition-all duration-500"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    <RefreshCw size={24} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                  <div>
                    <div className="font-bold text-sm">Tasa Automática</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold text-[9px]">Sincroniza con el BCV diariamente</div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={exchangeRate.mode === 'auto'} readOnly />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" style={{ backgroundColor: exchangeRate.mode === 'auto' ? 'var(--primary-color)' : '' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold shadow-lg hover:scale-[1.01] active:scale-95 transition-all">
                  Guardar Cambios
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardView;
