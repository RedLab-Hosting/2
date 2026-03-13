import { supabase } from './supabase';

/**
 * Service to manage exchange rates (BCV) for tenants.
 */
export const exchangeRateService = {
  /**
   * Fetches the current exchange rate for a tenant.
   */
  async getRate(tenantId) {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
    return data;
  },

  /**
   * Updates or creates the exchange rate for a tenant.
   */
  async updateRate(tenantId, rate, mode = 'auto') {
    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert({ 
        tenant_id: tenantId, 
        rate, 
        mode, 
        last_updated: new Promise(resolve => resolve(new Date().toISOString())) 
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * MOCK helper to simulate fetching from BCV.
   * In a real edge function, this would scrape bcv.org.ve.
   */
  async fetchBCVRate() {
    // Return a random-ish rate around 36.50 for simulation
    return 36.50 + (Math.random() * 0.5);
  },

  /**
   * Logic to trigger daily update (can be called from an Edge Function)
   */
  async syncRate(tenantId) {
    const current = await this.getRate(tenantId);
    if (current && current.mode === 'manual') return current;

    const newRate = await this.fetchBCVRate();
    return await this.updateRate(tenantId, newRate, 'auto');
  }
};
