import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { supabase } from '../../api/supabase';
import { exchangeRateService } from '../../api/exchangeRateService';
import ReceiptTicket from '../../components/Common/ReceiptTicket';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Clock, Truck, Package, MapPin } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'entrantes', label: 'Recibido', icon: Package, color: '#f59e0b' },
  { key: 'pendiente', label: 'En preparación', icon: Clock, color: '#3b82f6' },
  { key: 'asignado', label: 'Asignado', icon: Truck, color: '#8b5cf6' },
  { key: 'entregando', label: 'En camino', icon: MapPin, color: '#ec4899' },
  { key: 'entregados', label: 'Entregado', icon: CheckCircle2, color: '#22c55e' },
];

const OrderTrackingView = () => {
  const { orderId, tenantSlug } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(36.50);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [orderId]);

  useEffect(() => {
    const fetchRate = async () => {
      if (!tenant?.id) return;
      try {
        const data = await exchangeRateService.getRate(tenant.id);
        if (data) setExchangeRate(data.rate);
      } catch (err) { console.error(err); }
    };
    fetchRate();
  }, [tenant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black text-zinc-900 mb-2">Pedido no encontrado</h2>
        <button onClick={() => navigate(`/${tenantSlug}`)} className="mt-4 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold">
          Ir al menú
        </button>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(`/${tenantSlug}`)} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black">Seguimiento del Pedido</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Order Number Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 text-white rounded-3xl p-8 text-center"
        >
          <div className="text-sm uppercase tracking-widest opacity-50 font-bold mb-2">Pedido</div>
          <div className="text-4xl font-black">#{order.number || order.id?.slice(0,8).toUpperCase()}</div>
        </motion.div>

        {/* Status Timeline */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-zinc-200"
        >
          <h2 className="text-lg font-black mb-6">Estado del Pedido</h2>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const isActive = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive ? 'border-transparent text-white' : 'border-zinc-200 text-zinc-300 bg-white'
                      } ${isCurrent ? 'scale-110 shadow-lg' : ''}`}
                      style={isActive ? { backgroundColor: step.color } : {}}
                    >
                      <Icon size={18} />
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 ${isActive ? 'bg-zinc-300' : 'bg-zinc-100'}`} />
                    )}
                  </div>
                  <div className={`pt-2 ${isActive ? 'text-zinc-900' : 'text-zinc-300'}`}>
                    <div className={`font-bold text-sm ${isCurrent ? 'text-base' : ''}`}>{step.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* View Ticket button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onClick={() => setShowTicket(true)}
          className="w-full py-4 bg-white border border-zinc-200 rounded-2xl font-black text-sm hover:bg-zinc-50 transition-all active:scale-[0.98]"
        >
          Ver Ticket del Pedido
        </motion.button>
      </main>

      {/* Receipt Ticket Modal */}
      {showTicket && (
        <ReceiptTicket
          order={order}
          tenantName={tenant?.name || 'PRYSMA'}
          exchangeRate={exchangeRate}
          onClose={() => setShowTicket(false)}
        />
      )}
    </div>
  );
};

export default OrderTrackingView;
