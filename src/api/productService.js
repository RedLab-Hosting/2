import { BaseService } from './baseService';
import { supabase } from './supabase';

class ProductService extends BaseService {
  constructor(tenantId = null) {
    super('products', tenantId);
  }

  async getByCategory(categoryId) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('tenant_id', this.tenantId)
      .eq('category_id', categoryId);
    if (error) throw error;
    return data;
  }

  async updateAvailability(id, isAvailable) {
    return await this.update(id, { is_available: isAvailable });
  }
}

export const productService = new ProductService();
