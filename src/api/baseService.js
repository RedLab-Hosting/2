import { supabase } from './supabase';

export class BaseService {
  constructor(table, tenantId = null) {
    this.table = table;
    this.tenantId = tenantId;
  }

  setTenantId(id) {
    this.tenantId = id;
  }

  async getAll() {
    let query = supabase.from(this.table).select('*');
    if (this.tenantId) {
      query = query.eq('tenant_id', this.tenantId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(item) {
    const payload = this.tenantId ? { ...item, tenant_id: this.tenantId } : item;
    const { data, error } = await supabase
      .from(this.table)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, item) {
    const { data, error } = await supabase
      .from(this.table)
      .update(item)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}
