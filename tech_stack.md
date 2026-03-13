# 🛠️ Tecnologías y Funcionalidades del Sistema

Esta es una lista detallada de los componentes externos e internos que hacen funcionar la plataforma.

## 📦 Tecnologías Externas (Library & Frameworks)

### Core & UI

- **React 19**: Biblioteca principal para la interfaz de usuario.
- **Tailwind CSS**: Framework de CSS para el diseño rápido y responsivo, permitiendo personalización dinámica por empresa (branding).
- **React Router Dom (v7)**: Gestión de la navegación y rutas dinámicas para los distintos paneles (Admin, Cliente, etc.).
- **Framer Motion**: (Utilizada para micro-animaciones y transiciones suaves en la UI).
- **Lucide React**: Set de íconos vectoriales modernos.

### Backend & Datos

- **Supabase**: Backend-as-a-Service (BaaS) que provee:
  - **PostgreSQL**: Base de datos relacional.
  - **Auth**: Gestión de usuarios y sesiones.
  - **Edge Functions / Realtime**: Para actualizaciones en vivo de pedidos.
- **Service Workers**: Implementados para convertir la app en una **PWA (Progressive Web App)**, permitiendo instalación en móviles y funcionamiento offline básico.

### Geolocalización y Mapas

- **Leaflet**: Motor de mapas interactivos.
- **React-Leaflet**: Integración de Leaflet con componentes de React.
- **Leaflet Routing Machine**: Cálculo de rutas en tiempo real para el seguimiento del delivery.

### Utilidades Especializadas

- **QRCode.react**: Generación dinámica de códigos QR para mesas y accesos directos al menú.
- **Web-vitals**: Monitoreo del rendimiento de la aplicación.

---

## ⚙️ Funcionalidades Internas (Lógica Propia)

### Gestión de Multi-Tenant (Multi-Empresa)

- **TenantContext**: Sistema que detecta qué empresa está accediendo (vía URL o ID) y carga automáticamente sus colores, logo, bancos y productos.
- **tenant.config.js**: Archivo maestro que define las características habilitadas por cada cliente.

### Finanzas y Pagos

- **pagoMovil.js**: Utilidad para formatear y validar datos de transacciones de Pago Móvil (Venezuela).
- **tasaBCV.js**: Servicio para obtener y actualizar la tasa de cambio oficial automáticamente.
- **useTasa.js**: Hook personalizado para manejar conversiones de moneda en toda la app.

### Logística y Pedidos

- **locationUtils.js**: Cálculo de distancias y gestión de coordenadas para validar zonas de entrega.
- **pedidoHelpers.js**: Lógica centralizada para el manejo del carrito, cálculo de totales y estados del pedido.
- **time.js**: Normalización de horarios y formatos de tiempo para el registro de órdenes.

### Comunicación y Feedback

- **notificaciones.js**: Sistema interno para alertas visuales y sonidos cuando llega un pedido nuevo.
- **Clipboard Utility**: Función rápida para copiar datos de pago o enlaces de seguimiento.
- **ErrorBoundary**: Captura de errores críticos en la interfaz para evitar que la app se "rompa" ante un fallo inesperado.
