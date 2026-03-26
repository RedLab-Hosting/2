/**
 * Utility to generate a formatted WhatsApp message for orders.
 */
export const generateWhatsAppMessage = (orderData, cart, totalUSD, totalBS, deliveryCostUSD = 0, exchangeRate = 1) => {
  const { name, phone, deliveryType, address, paymentMethod, deliveryPaymentMethod } = orderData;
  
  const paymentText = {
    'zelle': '🇺🇸 Zelle (Dólares)',
    'pago_movil': '🇻🇪 Pago Móvil (Bolívares)',
    'cash': '💵 Efectivo'
  };

  const foodPayText = paymentText[paymentMethod] || 'No especificado';
  const deliveryPayText = deliveryPaymentMethod ? (paymentText[deliveryPaymentMethod] || 'No especificado') : null;

  const itemsText = cart.map(item => {
    const modifiersText = item.selectedModifiers 
      ? Object.entries(item.selectedModifiers).map(([k, v]) => `  - ${k}: ${v}`).join('\n')
      : '';
    return `*${item.quantity}x ${item.name}* (${item.price.toFixed(2)}$)\n${modifiersText}`;
  }).join('\n');

  const deliveryCostBS = (deliveryCostUSD * exchangeRate).toFixed(2);

  let message = `
*NUEVO PEDIDO - PRYSMA FAST FOOD* 🍔

*Datos del Cliente:*
👤 Nombre: ${name}
📞 Teléfono: ${phone}
🚚 Tipo: ${deliveryType === 'delivery' ? 'Delivery' : 'Retiro en Tienda'}
📍 Dirección: ${address || 'N/A'}

*Detalles del Pedido:*
${itemsText}

💳 *Pago Comida:* ${foodPayText}
*Subtotal:* ${totalUSD.toFixed(2)}$`;

  if (deliveryType === 'delivery' && deliveryCostUSD > 0) {
    message += `

🚛 *Delivery:* ${deliveryCostUSD}$ / ${deliveryCostBS} Bs.
💳 *Pago Delivery:* ${deliveryPayText || 'No especificado'}`;
  }

  message += `

*TOTAL A PAGAR:* 
💰 *${(totalUSD + deliveryCostUSD).toFixed(2)}$*
🇻🇪 *${totalBS.toFixed(2)} Bs.*

_Por favor, confirme la recepción indicando sus datos de pago._`;

  return encodeURIComponent(message.trim());
};

export const openWhatsApp = (phone, message) => {
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
};
