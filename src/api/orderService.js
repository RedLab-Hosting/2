import { BaseService } from './baseService';
import { supabase } from './supabase';

class OrderService extends BaseService {
  constructor(tenantId = null) {
    super('orders', tenantId);
  }

  /**
   * Create a full order with all data.
   */
  async createOrder(orderData) {
    const payload = {
      tenant_id: this.tenantId,
      status: 'entrantes',
      customer_data: {
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        phone: orderData.phone,
        address: orderData.address || '',
      },
      items: orderData.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedModifiers: item.selectedModifiers || null,
        image_url: item.image_url || '',
      })),
      total: orderData.totalUSD,
      payment_data: {
        food_payment: orderData.foodPayment,
        delivery_payment: orderData.deliveryPayment || null,
        delivery_cost_usd: orderData.deliveryCostUSD || 0,
        delivery_type: orderData.deliveryType,
        exchange_rate: orderData.exchangeRate,
        subtotal_usd: orderData.subtotalUSD,
      },
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get orders filtered by status.
   */
  async getByStatus(status) {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getByDriver(driverId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('delivery_driver_id', driverId);
    if (error) throw error;
    return data;
  }

  async updateStatus(id, status) {
    return await this.update(id, { status });
  }

  async assignDriver(orderId, driverId) {
    return await this.update(orderId, { 
      delivery_driver_id: driverId, 
      status: 'asignado' 
    });
  }
}

export const orderService = new OrderService();
