import { supabase } from './supabase';

/**
 * Service to manage customers per tenant.
 * Phone number + tenant_id is the unique identifier.
 */
export const customerService = {
  /**
   * Upsert a customer (create or update) by phone + tenant_id.
   */
  async upsertCustomer(tenantId, phone, firstName, lastName, lastLocation = null) {
    const payload = {
      tenant_id: tenantId,
      phone,
      first_name: firstName,
      last_name: lastName,
    };
    if (lastLocation) {
      payload.last_location = lastLocation;
    }

    const { data, error } = await supabase
      .from('customers')
      .upsert(payload, { onConflict: 'tenant_id,phone' })
      .select();

    if (error) {
      console.error('Error upserting customer:', error);
      throw error;
    }
    return data?.[0] || null;
  },

  /**
   * Get a customer by phone + tenant_id.
   */
  async getCustomer(tenantId, phone) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
    return data;
  }
};
