import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import SuperAdminView from './views/SuperAdmin/SuperAdminView';
import StorefrontView from './views/Client/StorefrontView';
import CheckoutView from './views/Client/CheckoutView';
import CartView from './views/Client/CartView';
import OrderTrackingView from './views/Client/OrderTrackingView';
import LoginView from './views/Login/LoginView';
import DeliveryView from './views/Delivery/DeliveryView';
import { TenantProvider } from './context/TenantContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import AdminDashboardView from './views/Admin/AdminDashboardView';

// Helper to redirect old hash-based URLs to true paths
function HashRedirector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // remove #
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const slug = pathSegments[0];

      if (slug && (hash === 'login' || hash === 'admin' || hash === 'checkout')) {
        navigate(`/${slug}/${hash}`, { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
}

import { AnimatePresence, motion } from 'framer-motion';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes({ isGitHubPages }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Super Admin Route */}
        <Route path="/superadmin" element={<PageWrapper><SuperAdminView /></PageWrapper>} />
        
        {/* Multi-tenant Routes */}
        <Route path="/:tenantSlug/login" element={
          <TenantProvider>
            <PageWrapper><LoginView /></PageWrapper>
          </TenantProvider>
        } />

        <Route path="/:tenantSlug/admin" element={
          <TenantProvider>
            <PageWrapper><AdminDashboardView /></PageWrapper>
          </TenantProvider>
        } />

        <Route path="/:tenantSlug/delivery" element={
          <TenantProvider>
            <PageWrapper><DeliveryView /></PageWrapper>
          </TenantProvider>
        } />

        {/* Multi-tenant Client Routes */}
        <Route path="/:tenantSlug" element={
          <TenantProvider>
            <CartProvider>
              <PageWrapper><StorefrontView /></PageWrapper>
            </CartProvider>
          </TenantProvider>
        } />

        <Route path="/:tenantSlug/cart" element={
          <TenantProvider>
            <CartProvider>
              <PageWrapper><CartView /></PageWrapper>
            </CartProvider>
          </TenantProvider>
        } />

        <Route path="/:tenantSlug/checkout" element={
          <TenantProvider>
            <CartProvider>
              <PageWrapper><CheckoutView /></PageWrapper>
            </CartProvider>
          </TenantProvider>
        } />

        <Route path="/:tenantSlug/order/:orderId" element={
          <TenantProvider>
            <PageWrapper><OrderTrackingView /></PageWrapper>
          </TenantProvider>
        } />

        <Route path="/" element={
          isGitHubPages ? (
            <TenantProvider>
              <CartProvider>
                <PageWrapper><StorefrontView /></PageWrapper>
              </CartProvider>
            </TenantProvider>
          ) : (
            <Navigate to="/superadmin" />
          )
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Determine basename for GitHub Pages subfolders
  const hostname = window.location.hostname;
  const isGitHubPages = hostname.includes('github.io');
  const pathSegments = window.location.pathname.split('/');
  const basename = isGitHubPages && pathSegments[1] ? `/${pathSegments[1]}` : '';

  return (
    <Router basename={basename}>
      <AuthProvider>
        <HashRedirector />
        <AnimatedRoutes isGitHubPages={isGitHubPages} />
      </AuthProvider>
    </Router>
  );
}

export default App;
