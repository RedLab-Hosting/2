import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { exchangeRateService } from '../../api/exchangeRateService';
import { customerService } from '../../api/customerService';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Navigation, Send, Truck, Store } from 'lucide-react';
import { generateWhatsAppMessage, openWhatsApp } from '../../utils/whatsappUtils';

// Fix for default marker icons in Leaflet with React
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

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

/**
 * Calculate distance in km between two [lat, lng] coordinates using Haversine formula.
 */
const calculateDistanceKm = (coord1, coord2) => {
  const R = 6371; // Earth radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const STORAGE_KEY = 'prysma_client_data';

const CheckoutView = () => {
  const navigate = useNavigate();
  const { cart, cartTotalUSD, cartCount, clearCart } = useCart();
  const { tenant, features } = useTenant();
  const [deliveryType, setDeliveryType] = useState(features.delivery ? 'delivery' : 'pickup');
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    address: '' 
  });
  
  // Store location from tenant settings
  const storeLocation = tenant?.settings?.store_location 
    ? [tenant.settings.store_location.lat, tenant.settings.store_location.lng] 
    : [10.4806, -66.9036]; // Caracas default
  
  const [position, setPosition] = useState(storeLocation);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);

  const [exchangeRate, setExchangeRate] = useState(36.50);

  // Payment methods — separate for food and delivery
  const [foodPayment, setFoodPayment] = useState('');
  const [deliveryPayment, setDeliveryPayment] = useState('');

  // Load saved client data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          phone: parsed.phone || '',
        }));
      }
    } catch (e) {
      console.error('Error loading saved client data:', e);
    }
  }, []);

  // Removed auto-geolocation on mount to avoid browsers auto-denying 
  // without explicit user interaction (fixes the blink bug).

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      if (!tenant?.id) return;
      try {
        const data = await exchangeRateService.getRate(tenant.id);
        if (data) setExchangeRate(data.rate);
      } catch (err) {
        console.error("Error fetching checkout rate", err);
      }
    };
    fetchRate();
  }, [tenant]);

  // Calculate delivery cost when position changes
  useEffect(() => {
    if (!locationCaptured || deliveryType !== 'delivery') {
      setDeliveryCost(0);
      return;
    }

    const kmPerCharge = tenant?.settings?.delivery_km_rate || 1;
    const chargePerUnit = tenant?.settings?.delivery_charge_usd || 1;

    const distanceKm = calculateDistanceKm(storeLocation, position);
    const units = Math.ceil(distanceKm / kmPerCharge);
    const cost = Math.ceil(units * chargePerUnit); // Always round to integer
    setDeliveryCost(cost);
  }, [position, locationCaptured, deliveryType, tenant]);

  // Dynamic totals based on selected payment methods
  let finalTotalBs = 0;
  let finalTotalUSD = 0;

  if (foodPayment === 'pago_movil') {
    finalTotalBs += cartTotalUSD * exchangeRate;
  } else if (foodPayment) {
    finalTotalUSD += cartTotalUSD;
  } else {
    finalTotalUSD += cartTotalUSD;
    finalTotalBs += cartTotalUSD * exchangeRate;
  }

  if (deliveryType === 'delivery') {
    if (deliveryPayment === 'pago_movil') {
      finalTotalBs += deliveryCost * exchangeRate;
    } else if (deliveryPayment) {
      finalTotalUSD += deliveryCost;
    } else {
      finalTotalUSD += deliveryCost;
      finalTotalBs += deliveryCost * exchangeRate;
    }
  }

  const totalUSD = cartTotalUSD + (deliveryType === 'delivery' ? deliveryCost : 0);
  const totalBS = totalUSD * exchangeRate;

  useEffect(() => {
    if (cartCount === 0) {
      // Optionally redirect
    }
  }, [cartCount]);

  const handleCaptureLocation = (e) => {
    e?.preventDefault();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLocationCaptured(true);
        },
        (err) => {
          alert(`No se pudo obtener tu ubicación: ${err.message}. Asegúrate de dar permisos.`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        alert('Por favor completa todos tus datos personales (Nombre, Apellido y Teléfono).');
        return;
      }

      if (!foodPayment) {
        alert('Selecciona un método de pago para la comida.');
        return;
      }
      if (deliveryType === 'delivery' && !deliveryPayment) {
        alert('Selecciona un método de pago para el delivery.');
        return;
      }
      
      setIsSubmitting(true);

      // Save client data to localStorage
      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clientData));

      // Upsert customer to Supabase
      try {
        if (tenant?.id && formData.phone) {
          await customerService.upsertCustomer(
            tenant.id,
            formData.phone,
            formData.firstName,
            formData.lastName,
            locationCaptured ? { lat: position[0], lng: position[1] } : null
          );
        }
      } catch (err) {
        console.error('Error saving customer to Supabase:', err);
      }

      // Save order to Supabase
      let savedOrder = null;
      try {
        const { orderService } = await import('../../api/orderService');
        orderService.setTenantId(tenant.id);
        savedOrder = await orderService.createOrder({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          items: cart,
          totalUSD,
          subtotalUSD: cartTotalUSD,
          deliveryCostUSD: deliveryType === 'delivery' ? deliveryCost : 0,
          deliveryType,
          foodPayment,
          deliveryPayment: deliveryType === 'delivery' ? deliveryPayment : null,
          exchangeRate,
        });
      } catch (err) {
        console.error('Error saving order:', err);
        alert('Error al guardar el pedido. Intenta de nuevo. ' + err.message);
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        deliveryType,
        address: formData.address,
        deliveryCostUSD: deliveryType === 'delivery' ? deliveryCost : 0,
        paymentMethod: foodPayment,
        deliveryPaymentMethod: deliveryPayment,
      };

      const message = generateWhatsAppMessage(orderData, cart, finalTotalUSD, finalTotalBs);
      
      openWhatsApp(tenant?.contact_info?.whatsapp || "584120000000", message);
      
      // Navigate to order tracking
      if (savedOrder?.id) {
        clearCart();
        navigate(`/${tenant?.slug || 'default'}/order/${savedOrder.id}`);
      }
      
      setIsSubmitting(false);
    } catch (criticalErr) {
      console.error('Critical submit error', criticalErr);
      alert('Error crítico: ' + criticalErr.message);
      setIsSubmitting(false);
    }
  };

  // Payment method buttons component (reusable for food and delivery)
  const PaymentSelector = ({ selected, onChange, label }) => (
    <section className="space-y-3">
      <h2 className="text-lg font-black px-1">{label}</h2>
      <div className="grid grid-cols-3 gap-3">
        {/* Order: Pago Móvil, Efectivo, Zelle */}
        {features.pago_movil && (
          <button
            type="button"
            onClick={() => onChange('pago_movil')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
              selected === 'pago_movil' 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-zinc-200 text-zinc-500 bg-white'
            }`}
            style={selected === 'pago_movil' ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}}
          >
            <div className="font-black text-sm">Pago Móvil</div>
            <span className="text-[10px] uppercase font-bold opacity-60">Bolívares</span>
          </button>
        )}
        {features.cash && (
          <button
            type="button"
            onClick={() => onChange('cash')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
              selected === 'cash' 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-zinc-200 text-zinc-500 bg-white'
            }`}
            style={selected === 'cash' ? { borderColor: 'var(--accent-2)', color: 'var(--accent-2)' } : {}}
          >
            <div className="font-black text-sm">Efectivo</div>
            <span className="text-[10px] uppercase font-bold opacity-60">Dólares</span>
          </button>
        )}
        {features.zelle && (
          <button
            type="button"
            onClick={() => onChange('zelle')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
              selected === 'zelle' 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-zinc-200 text-zinc-500 bg-white'
            }`}
            style={selected === 'zelle' ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}}
          >
            <div className="font-black text-sm">Zelle</div>
            <span className="text-[10px] uppercase font-bold opacity-60">Dólares</span>
          </button>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-12">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Finalizar Pedido</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Delivery Type Toggle */}
          {(features.delivery || features.pickup) && (
            <div className="grid grid-cols-2 gap-3 bg-white p-1.5 rounded-2xl border border-zinc-200">
              {features.delivery && (
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    deliveryType === 'delivery' ? 'text-white' : 'text-zinc-500 hover:bg-zinc-50'
                  }`}
                  style={deliveryType === 'delivery' ? { backgroundColor: 'var(--primary-color)' } : {}}
                >
                  <Truck size={20} /> Delivery
                </button>
              )}
              {features.pickup && (
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    deliveryType === 'pickup' ? 'text-white' : 'text-zinc-500 hover:bg-zinc-50'
                  }`}
                  style={deliveryType === 'pickup' ? { backgroundColor: 'var(--primary-color)' } : {}}
                >
                  <Store size={20} /> Retiro
                </button>
              )}
            </div>
          )}

          {/* Food Payment Method */}
          <PaymentSelector 
            selected={foodPayment} 
            onChange={setFoodPayment} 
            label="Método de Pago — Comida" 
          />

          {/* Customer Info */}
          <section className="bg-white rounded-3xl p-6 border border-zinc-200 space-y-4">
            <h2 className="text-xl font-bold mb-4">Tus Datos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">Nombre</label>
                <input 
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ej. Juan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">Apellido</label>
                <input 
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">Teléfono de Contacto</label>
              <input 
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Ej. 04121234567"
              />
            </div>
          </section>

          {/* Delivery Location Section */}
          {deliveryType === 'delivery' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-white rounded-3xl overflow-hidden border border-zinc-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">Ubicación de Entrega</h2>
                <p className="text-sm text-zinc-500 mb-4">Selecciona tu ubicación en el mapa o usa el botón para obtener tu ubicación actual.</p>
                
                <div className="h-64 rounded-2xl overflow-hidden border border-zinc-200 relative z-10">
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker position={position} setPosition={(pos) => { setPosition(pos); setLocationCaptured(true); }} />
                  </MapContainer>
                  
                  <button 
                    type="button"
                    onClick={handleCaptureLocation}
                    className="absolute bottom-4 right-4 z-[1000] bg-white py-2 px-4 rounded-full shadow-xl border border-zinc-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    <Navigation size={18} />
                    Mi ubicación
                  </button>
                </div>

                {/* Delivery cost display */}
                {locationCaptured && (
                  <div className="mt-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <MapPin size={18} />
                      <span className="font-bold text-sm">Costo de delivery</span>
                    </div>
                    <span className="font-black text-lg text-zinc-900">${deliveryCost}</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">Referencia o Dirección Detallada</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Casa #, punto de referencia..."
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Delivery Payment Method — after map */}
              <div className="p-6 pt-0">
                <PaymentSelector 
                  selected={deliveryPayment} 
                  onChange={setDeliveryPayment} 
                  label="Método de Pago — Delivery" 
                />
              </div>
            </motion.section>
          )}

          {/* Summary & Submit */}
          <section className="bg-zinc-900 text-white rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold mb-4 opacity-70">Resumen del Pedido</h2>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span>Subtotal</span>
              <span className="font-bold">${cartTotalUSD.toFixed(2)}</span>
            </div>
            {deliveryType === 'delivery' && (
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span>Costo Delivery</span>
                <span className="font-bold">${deliveryCost}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-4 border-t border-white/10 mt-4">
              <div>
                <span className="block text-xs uppercase tracking-widest font-bold opacity-60">Total a pagar</span>
              </div>
              <div className="text-right">
                {finalTotalUSD > 0 && (
                  <span className="block text-3xl font-bold">${finalTotalUSD.toFixed(2)}</span>
                )}
                {finalTotalBs > 0 && (
                  <span className="block text-xl font-bold">{finalTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</span>
                )}
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full mt-6 py-5 bg-primary rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all"
              style={{ backgroundColor: 'var(--primary-color, #ea580c)', color: 'white' }}
            >
              <Send size={24} />
              Confirmar por WhatsApp
            </button>
          </section>
        </form>
      </main>
    </div>
  );
};

export default CheckoutView;
