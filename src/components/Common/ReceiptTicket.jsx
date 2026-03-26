import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

/**
 * Formats an amount according to the payment method.
 * PagoMóvil → Bs., Cash/Zelle → USD
 */
const formatAmount = (usd, exchangeRate, paymentMethod) => {
  if (paymentMethod === 'pago_movil') {
    const bs = (usd * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${bs} Bs.`;
  }
  return `$${usd.toFixed(2)}`;
};

const paymentMethodLabel = (method) => ({
  'pago_movil': 'Pago Móvil',
  'cash': 'Efectivo',
  'zelle': 'Zelle',
}[method] || method || 'N/A');

const ReceiptTicket = ({ order, tenantName = 'PRYSMA', exchangeRate = 1, onClose }) => {
  const receiptRef = useRef(null);

  if (!order) return null;

  const customer = order.customer_data || {};
  const items = order.items || [];
  const payment = order.payment_data || {};
  const subtotalUSD = payment.subtotal_usd || order.total || 0;
  const deliveryCostUSD = payment.delivery_cost_usd || 0;
  const totalUSD = subtotalUSD + deliveryCostUSD;
  const rate = payment.exchange_rate || exchangeRate;
  const foodPayment = payment.food_payment || '';
  const deliveryPayment = payment.delivery_payment || '';
  const orderDate = order.created_at ? new Date(order.created_at) : new Date();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
      <head>
        <title>Ticket #${order.number || order.id?.slice(0,8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 4mm; }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .line { display: flex; justify-content: space-between; padding: 2px 0; }
          .item-mods { font-size: 10px; color: #666; padding-left: 12px; }
          h1 { font-size: 16px; margin-bottom: 4px; }
          h2 { font-size: 13px; margin: 4px 0; }
          .total-line { font-size: 14px; font-weight: bold; }
          @media print { body { width: 80mm; } }
        </style>
      </head>
      <body>
        ${receiptRef.current?.innerHTML || ''}
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Receipt */}
      <div className="relative bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Print button */}
        <div className="sticky top-0 bg-white p-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <h2 className="font-black text-zinc-900">Ticket de Pedido</h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Printer size={16} /> Imprimir
          </button>
        </div>

        {/* Receipt content */}
        <div ref={receiptRef} className="p-6 font-mono text-xs leading-relaxed">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="font-black text-base">{tenantName.toUpperCase()}</div>
            <div className="text-zinc-500 text-[10px]">MENÚ DIGITAL • PRYSMA</div>
          </div>

          <div className="border-t border-dashed border-zinc-300 my-3" />

          {/* Order Info */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Pedido:</span>
              <span className="font-bold">#{order.number || order.id?.slice(0,8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{orderDate.toLocaleDateString('es-VE')}</span>
            </div>
            <div className="flex justify-between">
              <span>Hora:</span>
              <span>{orderDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-zinc-300 my-3" />

          {/* Customer */}
          <div className="space-y-1 mb-3">
            <div className="font-bold">CLIENTE:</div>
            <div>{customer.first_name} {customer.last_name}</div>
            <div>Tel: {customer.phone}</div>
            {customer.address && <div>Dir: {customer.address}</div>}
            <div>Tipo: {payment.delivery_type === 'delivery' ? 'Delivery' : 'Retiro'}</div>
          </div>

          <div className="border-t border-dashed border-zinc-300 my-3" />

          {/* Items */}
          <div className="mb-3">
            <div className="font-bold mb-2">DETALLE:</div>
            {items.map((item, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.selectedModifiers && Object.entries(item.selectedModifiers).map(([k, v]) => (
                  <div key={k} className="text-zinc-400 pl-3 text-[10px]">· {k}: {v}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-zinc-300 my-3" />

          {/* Totals */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatAmount(subtotalUSD, rate, foodPayment)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Pago Comida:</span>
              <span>{paymentMethodLabel(foodPayment)}</span>
            </div>
            {deliveryCostUSD > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{formatAmount(deliveryCostUSD, rate, deliveryPayment)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Pago Delivery:</span>
                  <span>{paymentMethodLabel(deliveryPayment)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t-2 border-dashed border-zinc-900 my-3" />

          {/* Grand Total */}
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>TOTAL USD:</span>
            <span>${totalUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL Bs.:</span>
            <span>{(totalUSD * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</span>
          </div>
          <div className="text-center text-[10px] text-zinc-400 mt-1">
            Tasa: {rate} Bs/$
          </div>

          <div className="border-t border-dashed border-zinc-300 my-3" />

          {/* Footer */}
          <div className="text-center text-[10px] text-zinc-400">
            <div>¡Gracias por tu compra!</div>
            <div className="mt-1">Powered by Prysma</div>
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <div className="p-4 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptTicket;
