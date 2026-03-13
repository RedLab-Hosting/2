vamos a crear una web app
hosteada en github, programada con JavaScript y React con base de datos en SupaBase, dame un panel de super admin para crear una nueva empresa, y de ahi vamos trabajando, quiero hacer un nucleo central en github, y que los repos rama se alimenten de el para asegurar actualizaciones futuras, hago enfasis en que quiero escalar a varias empresas / franquicias y cada una debe ser personalizable, explicame paso a paso lo que tenemos que hacer, vamos desde crear el repo nucleo en git hub hasta configurar supabase
paso a paso

# Especificación Funcional: Fast Food App V2 🍔🚀

Esta documentación desglosa el proyecto en bloques funcionales y técnicos para una reconstrucción total desde cero, optimizada para **Supabase** y una arquitectura de código moderna (**React + Vite + Tailwind**).

---

## 1. Bloque de Arquitectura Core (Multi-Tenancy)

El corazón del sistema. Permite que múltiples negocios operen en la misma plataforma con total aislamiento.

- **Identidad Dinámica**: Cada local tiene su propio `slug` (ej: `/burger-king`), logo, colores y fuentes.
- **Feature Flags**: Capacidad de activar/desactivar módulos por local (ej: unos usan Zelle, otros no).
- **Aislamiento de Datos**: RLS (Row Level Security) nivel Dios. Ningún local puede ver pedidos o productos de otro.
- **Configuración en Tiempo Real**: Los cambios en el nombre o logo se reflejan instantáneamente en la app del cliente.

---

## 2. Bloque Super Admin (Control Central)

Panel de control para el dueño de la plataforma.

- **Gestión de Empresas**: CRUD de locales (Crear, Editar, Pausar).
- **Personalización de Marca**: Editor visual de temas (Primary Color, Dark Mode, etc.) por local.
- **Métricas Globales**: Total de ventas y locales activos.
- **Gestión de Super Usuarios**: Control de quién tiene acceso a este panel.

---

## 3. Bloque Administrador de Local (Dashboard Business)

Donde el dueño del local gestiona su día a día.

- **Gestión de Pedidos (Live)**: Tablero tipo Kanban o lista real-time con estados (Pendiente, Preparando, Enviado, Completado).
- **Gestión de Menú**:
  - Categorías dinámicas con iconos/emojis.
  - Productos con múltiples variantes/extras (ej: Con/Sin cebolla, Extra queso).
  - Control de inventario (Disponible/Agotado).
- **Configuración de Delivery**:
  - Cálculo automático por KM usando Leaflet/OSM.
  - Zonas de entrega y costos base.
- **Gestión de Impresión**: Generación automática de tickets PDF/Térmicos para despacho.
- **Caja y Tasas**: Sincronización automática con el dólar (BCV) o tasa manual.

---

## 4. Bloque Delivery (App del Repartidor)

Interfaz optimizada para móviles.

- **Hoja de Ruta**: Lista de pedidos asignados con prioridad.
- **Navegación**: Enlace directo a Google Maps/Waze con la dirección del cliente.
- **Gestión de Estado**: Botones rápidos para indicar "Llegué al sitio" o "Entregado".
- **Notificaciones Push**: Alertas inmediatas cuando se le asigna un nuevo pedido.

---

## 5. Bloque Cliente (Frontend de Venta)

Experiencia de usuario rápida y "deliciosa".

- **Catálogo Interactivo**: Navegación por categorías con scroll suave y efectos visuales.
- **Carrito Inteligente**: Gestión de extras y notas especiales por producto.
- **Checkout en 3 Pasos**:
  1.  **Tipo de Entrega**: Delivery o Pickup.
  2.  **Ubicación**: Pin en el mapa + detección de GPS automática.
  3.  **Pago**: Selección entre Pago Móvil (con QR dinámico), Zelle o Efectivo.
- **Seguimiento Real-time**: El cliente ve el progreso de su pedido sin refrescar la página.

---

## 6. Estructura Técnica Sugerida (V2)

```text
src/
├── api/             # Servicios de Supabase separados por dominio
├── components/      # UI Atómica (Button, Input, Card)
├── context/         # AuthContext, TenantContext, CartContext
├── hooks/           # useOrders, useProducts, useRealtime
├── layouts/         # AdminLayout, ClientLayout
├── views/
│   ├── Client/      # Vistas para el consumidor
│   ├── Admin/       # Vistas para el dueño del local
│   └── SuperAdmin/  # Vistas para el dueño de la plataforma
├── utils/           # Ayudantes de formato, cálculos de mapas
└── constants/       # Configuraciones estáticas
```

---

## 7. Esquema de Base de Datos (Refinado)

- **`tenants`**: ID, nombre, theme (JSON), features (JSON), location (Point), settings.
- **`profiles`**: ID (Auth), tenant_id, role (admin/delivery/super), name.
- **`categories`**: ID, tenant_id, label, icon, order. (Mejor que JSON para filtrar).
- **`products`**: ID, category_id, tenant_id, name, price, variants (JSON), stock.
- **`orders`**: ID, tenant_id, number, status, customer_data (JSON), items (JSON), total, payment_data.
- **`exchange_rates`**: tenant_id, rate, mode, updated_at.

---

## 8. Elementos de "Efecto WOW" (Mandatorios)

- **Animaciones**: Framer Motion para transiciones entre páginas.
- **Glassmorphism**: En headers y modales para un look premium.
- **Modo Oscuro**: Implementado nativamente.
- **Real-time total**: Nada de recargar. Si el admin cambia el precio, el cliente lo ve al instante.

---
