import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { supabase } from '../../api/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle2, MapPin, Navigation, RefreshCw } from 'lucide-react';

const STATUS_LABELS = {
  'asignado': { label: 'Asignado', color: '#8b5cf6', icon: Package },
  'entregando': { label: 'En camino', color: '#ec4899', icon: Truck },
  'entregados': { label: 'Entregado', color: '#22c55e', icon: CheckCircle2 },
};

const DeliveryView = () => {
  const { tenant } = useTenant();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState('Repartidor');

  useEffect(() => {
    if (!tenant?.id) return;
    loadOrders();

    // Real-time subscription
    const channel = supabase
      .channel('delivery-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `tenant_id=eq.${tenant.id}`,
      }, () => loadOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [tenant]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenant.id)
        .in('status', ['asignado', 'entregando'])
        .order('created_at', { ascending: false });

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
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-40 bg-zinc-900 text-white">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color, #ea580c)' }}>
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black">Panel de Delivery</h1>
              <span className="text-[10px] text-white/50 uppercase tracking-widest">{tenant?.name || 'Prysma'}</span>
            </div>
          </div>
          <button onClick={loadOrders} className="p-2 text-white/60 hover:text-white transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={28} className="text-zinc-300" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-2">Sin entregas pendientes</h2>
            <p className="text-zinc-500 text-sm">Las nuevas entregas aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orders.map(order => {
              const customer = order.customer_data || {};
              const payment = order.payment_data || {};
              const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS['asignado'];
              const Icon = statusInfo.icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden"
                >
                  {/* Status banner */}
                  <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: statusInfo.color + '10' }}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color: statusInfo.color }} />
                      <span className="font-bold text-sm" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-zinc-500">#{order.number || order.id?.slice(0,8)}</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Customer + Address */}
                    <div>
                      <div className="font-black text-base">{customer.first_name} {customer.last_name}</div>
                      <div className="text-sm text-zinc-500 mt-1">{customer.phone}</div>
                      {customer.address && (
                        <div className="text-sm text-zinc-600 mt-1 flex items-start gap-1.5">
                          <MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" />
                          {customer.address}
                        </div>
                      )}
                    </div>

                    {/* Items summary */}
                    <div className="bg-zinc-50 rounded-xl p-3 text-xs">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex justify-between py-0.5">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery cost */}
                    {payment.delivery_cost_usd > 0 && (
                      <div className="flex justify-between text-sm font-bold">
                        <span>Delivery:</span>
                        <span>${payment.delivery_cost_usd}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                      <span className="font-bold text-sm">Total:</span>
                      <span className="font-black text-lg">${order.total?.toFixed(2)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      {order.status === 'asignado' && (
                        <button
                          onClick={() => updateStatus(order.id, 'entregando')}
                          className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                          style={{ backgroundColor: '#ec4899' }}
                        >
                          <Navigation size={16} /> Iniciar Entrega
                        </button>
                      )}
                      {order.status === 'entregando' && (
                        <button
                          onClick={() => updateStatus(order.id, 'entregados')}
                          className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                          style={{ backgroundColor: '#22c55e' }}
                        >
                          <CheckCircle2 size={16} /> Marcar Entregado
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default DeliveryView;
