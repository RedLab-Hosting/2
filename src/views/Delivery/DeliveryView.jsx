import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../api/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle2, MapPin, Navigation, RefreshCw, User, LogOut, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to smoothly center map
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

const DeliveryView = () => {
  const { tenant } = useTenant();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Maps setup: Center on tenant store by default
  const storeLat = tenant?.settings?.store_location?.lat || 10.4806;
  const storeLng = tenant?.settings?.store_location?.lng || -66.9036;

  // The active order is the first one being delivered, or if none, the first assigned.
  const activeOrder = orders.find(o => o.status === 'entregando') || orders.find(o => o.status === 'asignado');

  // Determine map center
  const mapCenter = activeOrder?.customer_data?.lat && activeOrder?.customer_data?.lng 
    ? [activeOrder.customer_data.lat, activeOrder.customer_data.lng]
    : [storeLat, storeLng];


  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    fetchProfile();

  }, [user]);

  useEffect(() => {
    if (!tenant?.id || !user?.id) return;
    loadOrders();

    // Real-time subscription
    const channel = supabase
      .channel('delivery-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `delivery_driver_id=eq.${user.id}`,
      }, () => loadOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [tenant, user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('delivery_driver_id', user.id)
        .in('status', ['asignado', 'entregando'])
        .order('created_at', { ascending: true }); // Process oldest first

      if (!error) setOrders(data || []);
    } catch (err) {
      console.error('Error loading delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      loadOrders();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar pedido.');
    }
  };

  const getCollectionAmount = (order) => {
    if (!order) return null;
    const payment = order.payment_data || {};
    // If they already paid everything via Zelle or Pago Movil upfront, collection could be 0
    // But let's assume if it is Cash, we need to collect.
    // For simplicity, we just display the delivery cost or cash total.
    
    // Check if delivery was paid in cash
    if (payment.delivery_payment === 'cash') {
      return { 
        amount: payment.delivery_cost_usd, 
        currency: '$', 
        label: 'Cobrar Delivery' 
      };
    } else if (payment.delivery_payment === 'pago_movil') {
      return { 
        amount: payment.delivery_cost_usd * (payment.exchange_rate || 1), 
        currency: 'Bs', 
        label: 'Verificar Pago Móvil Delivery' 
      };
    }
    
    // If it's a generic order total (compatibility)
    return {
      amount: order.total,
      currency: '$',
      label: 'Total Pedido (Ref)'
    };
  };

  const collectionAmount = getCollectionAmount(activeOrder);

  return (
    <div className="h-dvh w-full relative bg-zinc-900 overflow-hidden font-sans flex flex-col">
      {/* 1. Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }} 
          zoomControl={false}
          attributionControl={false}
        >
          {/* Using CartoDB Positron for a cleaner, modern app look */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          
          <MapCenterUpdater center={mapCenter} />

          {/* Store Marker (Fixed) */}
          <Marker position={[storeLat, storeLng]} opacity={activeOrder ? 0.5 : 1} />
          
          {/* Customer Marker (Dynamic if coords exist) */}
          {activeOrder?.customer_data?.lat && activeOrder?.customer_data?.lng && (
            <Marker position={[activeOrder.customer_data.lat, activeOrder.customer_data.lng]} />
          )}
        </MapContainer>
        
        {/* Map gradient overlay so UI elements pop */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/30 pointer-events-none z-10" />
      </div>

      {/* 2. Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-40 p-4 pt-6">
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] shadow-lg border border-white/20 p-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white font-black text-sm uppercase">
              {profile?.name?.[0] || 'D'}
            </div>
            <div>
              <h1 className="text-sm font-black text-zinc-900 leading-tight">{profile?.name || 'Repartidor'}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">En Línea</span>
              </div>
            </div>
          </div>
          
          <button onClick={() => logout()} className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 3. Bottom Sheet UI */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {loading ? (
          <div className="bg-white rounded-t-[32px] p-10 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : activeOrder ? (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pt-3 pb-8 px-6 lg:max-w-md mx-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

            {/* Status Pill */}
            <div className="flex justify-between items-center mb-4">
               {activeOrder.status === 'asignado' && (
                 <span className="bg-orange-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                   Nuevo Pedido Asignado
                 </span>
               )}
               {activeOrder.status === 'entregando' && (
                 <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                   En Camino al Cliente
                 </span>
               )}
               <span className="font-mono text-zinc-400 font-bold text-xs border border-zinc-200 px-2 py-0.5 rounded-md">
                 #{activeOrder.number || activeOrder.id?.slice(0,4)}
               </span>
            </div>

            {/* Customer Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">
                  {activeOrder.customer_data.first_name} {activeOrder.customer_data.last_name}
                </h2>
                <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium mt-2">
                  <MapPin size={14} className="text-primary" style={{ color: 'var(--primary-color)' }} />
                  {activeOrder.customer_data.address || 'Dirección no especificada'}
                </div>
              </div>
              
              <a 
                href={`tel:${activeOrder.customer_data.phone}`}
                className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0 shadow-sm active:scale-90 transition-transform"
              >
                <Phone size={18} fill="currentColor" />
              </a>
            </div>

            {/* Order Items Summary */}
            <div className="bg-zinc-50 rounded-2xl p-4 mb-4 border border-zinc-100">
              <div className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Contenido del Pedido</div>
              <div className="space-y-1.5">
                {(activeOrder.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-bold text-zinc-700">
                    <span className="truncate pr-4"><span className="text-zinc-400 mr-1">{item.quantity}x</span> {item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials / Collection */}
            <div className="flex justify-between items-end mb-6 px-1">
               <div>
                  <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">{collectionAmount?.label}</div>
                  <div className="text-3xl font-black text-zinc-900 tracking-tighter">
                     {collectionAmount?.currency === '$' ? '$' : ''}{Number(collectionAmount?.amount || 0).toFixed(2)}{collectionAmount?.currency === 'Bs' ? ' Bs.' : ''}
                  </div>
               </div>
               {activeOrder.payment_data?.food_payment === 'pago_movil' && activeOrder.payment_data?.delivery_payment === 'pago_movil' && (
                 <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Pre-Pagado ✅
                 </div>
               )}
            </div>

            {/* Actions */}
            {activeOrder.status === 'asignado' && (
              <button 
                onClick={() => updateStatus(activeOrder.id, 'entregando')} 
                className="w-full py-5 rounded-2xl text-white font-black text-base uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(24,24,27,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                style={{ backgroundColor: 'var(--primary-color, #18181b)' }}
              >
                <Navigation size={20} /> Iniciar Ruta
              </button>
            )}
            
            {activeOrder.status === 'entregando' && (
              <button 
                onClick={() => updateStatus(activeOrder.id, 'entregados')} 
                className="w-full py-5 rounded-2xl bg-zinc-900 text-white font-black text-base uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(24,24,27,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {/* Swipe simulation background glow */}
                <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <CheckCircle2 size={24} className="text-emerald-400" /> Marcar Entregado
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-8 text-center pb-12 lg:max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
               <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
               <Truck size={32} className="text-emerald-600 relative z-10" />
            </div>
            <h3 className="font-black text-2xl text-zinc-900 tracking-tight mb-2">Buscando pedidos</h3>
            <p className="text-sm text-zinc-500 font-medium px-4">Mantén la aplicación abierta. Tu próximo servicio aparecerá aquí en cualquier momento.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DeliveryView;
