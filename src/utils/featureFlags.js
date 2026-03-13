/**
 * Simple utility to check feature availability for a tenant.
 */
export const isFeatureEnabled = (tenant, featureKey) => {
  if (!tenant || !tenant.features) return false;
  return !!tenant.features[featureKey];
};

/**
 * Standard feature keys used in the application.
 */
export const FEATURES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  ZELLE: 'zelle',
  PAGO_MOVIL: 'pago_movil',
  CASH: 'cash',
  MODIFIERS: 'modifiers',
  INVENTORY: 'inventory'
};
