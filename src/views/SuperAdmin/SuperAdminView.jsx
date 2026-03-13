import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Plus, Building2, LayoutDashboard, Settings, Loader2 } from 'lucide-react';

const SuperAdminView = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '', primaryColor: '#ea580c' });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (data) setTenants(data);
    setLoading(false);
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('tenants').insert([
      { 
        name: newTenant.name, 
        slug: newTenant.slug,
        theme: { primaryColor: newTenant.primaryColor }
      }
    ]);
    
    if (!error) {
      setShowModal(false);
      fetchTenants();
      setNewTenant({ name: '', slug: '', primaryColor: '#ea580c' });
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <Building2 className="text-orange-500" /> PRYSMA CORE
        </h2>
        <nav className="space-y-4">
          <a href="#" className="flex items-center gap-3 p-3 bg-orange-600 rounded-lg">
            <LayoutDashboard size={20} /> Empresas
          </a>
          <a href="#" className="flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors">
            <Settings size={20} /> Configuración Global
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Panel de Super Admin</h1>
            <p className="text-slate-500">Gestiona el ecosistema de franquicias</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus size={20} /> Nueva Empresa
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-orange-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((t) => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 className="text-slate-500" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase">
                    Activa
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{t.name}</h3>
                <p className="text-sm text-slate-500 mb-4">slug: /{t.slug}</p>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.theme.primaryColor }}></div>
                  <span className="text-xs text-slate-400">Color Principal</span>
                </div>
                <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                  Gestionar Sucursal
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Nueva Empresa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Crear Nueva Franchise</h2>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercial</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Burger House"
                  className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                <input 
                  type="text" 
                  required
                  placeholder="ej: burger-house"
                  className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({...newTenant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color Principal</label>
                <input 
                  type="color" 
                  className="w-full h-12 p-1 rounded-lg border border-slate-200 cursor-pointer"
                  value={newTenant.primaryColor}
                  onChange={(e) => setNewTenant({...newTenant, primaryColor: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminView;
