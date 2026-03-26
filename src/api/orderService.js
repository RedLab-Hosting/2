import { BaseService } from './baseService';
import { supabase } from './supabase';

class OrderService extends BaseService {
  constructor(tenantId = null) {
    super('orders', tenantId);
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
}

export const orderService = new OrderService();
