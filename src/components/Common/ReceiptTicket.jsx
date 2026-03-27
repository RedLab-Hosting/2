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
        <div className="bg-zinc-200 p-4 sm:p-8 flex justify-center">
          <div ref={receiptRef} className="bg-white p-6 shadow-sm mx-auto" style={{ width: '80mm', minWidth: '300px', fontFamily: '"Courier New", Courier, monospace', color: '#000', fontSize: '13px', lineHeight: '1.4' }}>
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="font-bold text-xl uppercase tracking-widest leading-none mb-1">{tenantName}</h1>
              <div className="text-xs uppercase">J-31823901-2</div>
              <div className="text-[10px] uppercase mt-1">Av. Principal, Edificio Central</div>
              <div className="text-[10px] uppercase mb-2">ZONA POSTAL 1010</div>
              <div className="text-sm font-bold mt-4">============= TICKET =============</div>
            </div>

            <div className="text-xs mb-3 font-medium">
              <div className="flex justify-between">
                <span>FECHA: {orderDate.toLocaleDateString('es-VE')}</span>
                <span>HORA: {orderDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="mt-1">PEDIDO: <span className="font-bold">#{order.number || order.id?.slice(0,8).toUpperCase()}</span></div>
              <div className="mt-1">CAJERO: 01 (CAJA PRINCIPAL)</div>
            </div>

            <div className="border-t-2 border-dashed border-black my-2" />
            
            {/* Customer */}
            <div className="text-xs mb-3 uppercase">
              <div className="font-bold">DATOS DEL CLIENTE:</div>
              <div className="mt-1">NOMBRE: {customer.first_name} {customer.last_name}</div>
              {customer.ci && <div>CI/RIF: {customer.ci}</div>}
              <div>TELF: {customer.phone}</div>
              <div className="mt-1 font-bold">TIPO: {payment.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRO'}</div>
            </div>

            <div className="border-t-2 border-dashed border-black my-2" />

            {/* Table Header */}
            <div className="flex justify-between font-bold text-xs uppercase my-2">
              <span className="w-8">CANT</span>
              <span className="flex-1 text-left">DESCRIPCION</span>
              <span className="w-16 text-right">TOTAL</span>
            </div>
            
            <div className="border-t-2 border-dashed border-black my-2" />

            {/* Items */}
            <div className="text-xs mb-4">
              {items.map((item, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between items-start font-bold">
                    <span className="w-8">{item.quantity}</span>
                    <span className="flex-1 text-left uppercase pr-2 leading-tight">{item.name}</span>
                    <span className="w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.selectedModifiers && Object.entries(item.selectedModifiers).map(([k, v]) => (
                    <div key={k} className="pl-8 text-[10px] uppercase text-zinc-600">+{k}: {v}</div>
                  ))}
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-black my-2" />

            {/* Totals */}
            <div className="text-xs space-y-1 my-3 uppercase">
              <div className="flex justify-between">
                <span>SUB-TOTAL:</span>
                <span>{formatAmount(subtotalUSD, rate, foodPayment)}</span>
              </div>
              {deliveryCostUSD > 0 && (
                <div className="flex justify-between">
                  <span>DELIVERY:</span>
                  <span>{formatAmount(deliveryCostUSD, rate, deliveryPayment)}</span>
                </div>
              )}
              <div className="flex justify-between mt-1 text-[10px]">
                <span>EXENTO:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-dashed border-black">
                <span>TOTAL (USD):</span>
                <span>${totalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-1">
                <span>TOTAL A PAGAR:</span>
                <span>{(totalUSD * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-black my-2" />

            {/* Payment Info */}
            <div className="text-[10px] uppercase space-y-1 mb-4 mt-3">
              <div className="text-center font-bold">TASA BCV: {rate} BS/USD</div>
              <div className="font-bold border-2 border-black p-2 text-center mt-3 text-xs tracking-widest">
                MÉTODOS DE PAGO: <br/> {paymentMethodLabel(foodPayment)} {deliveryCostUSD > 0 && deliveryPayment !== foodPayment ? `+ ${paymentMethodLabel(deliveryPayment)}` : ''}
              </div>
            </div>

            <div className="border-t-2 border-black my-2" />
            
            {/* Footer */}
            <div className="text-center text-[10px] uppercase font-bold mt-4 space-y-1">
              <div>*** GRACIAS POR SU COMPRA ***</div>
              <div className="font-normal mt-3 opacity-60">SISTEMA CREADO POR PRYSMA</div>
            </div>
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
