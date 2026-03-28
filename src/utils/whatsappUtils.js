/**
 * Utility to generate a formatted WhatsApp message for orders.
 */
export const generateWhatsAppMessage = (orderData, cart, finalTotalUSD, finalTotalBs) => {
  const { name, phone, deliveryType, address, paymentMethod, deliveryPaymentMethod, deliveryCostUSD } = orderData;
  
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

  let message = `
*NUEVO PEDIDO - PRYSMA FAST FOOD* 🍔

*Datos del Cliente:*
👤 Nombre: ${name}
📞 Teléfono: ${phone}
🚚 Tipo: ${deliveryType === 'delivery' ? 'Delivery' : 'Retiro en Tienda'}
📍 Dirección: ${address || 'N/A'}

*Detalles del Pedido:*
${itemsText}

💳 *Pago Comida:* ${foodPayText}`;

  if (deliveryType === 'delivery' && deliveryCostUSD > 0) {
    message += `
🚛 *Costo Delivery:* ${deliveryCostUSD.toFixed(2)}$
💳 *Pago Delivery:* ${deliveryPayText || 'No especificado'}`;
  }

  message += `

*TOTAL A PAGAR:*`;

  if (finalTotalUSD > 0) {
    message += `\n💰 *${finalTotalUSD.toFixed(2)}$*`;
  }
  if (finalTotalBs > 0) {
    message += `\n🇻🇪 *${finalTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.*`;
  }

  message += `

_Por favor, confirme la recepción indicando sus datos de pago._`;

  return encodeURIComponent(message.trim());
};

export const openWhatsApp = (phone, message) => {
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
};
