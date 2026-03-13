# 🚀 Guía de Replicación - Fast Food Platform

Esta guía detalla todo lo necesario para replicar exactamente la estructura, dependencias y configuración de esta aplicación web multi-tenant.

## 📁 Distribución de Carpetas

La arquitectura sigue un patrón modular donde el `core` es compartido y la personalización se gestiona vía Context API.

```text
demo-page/
├── public/                 # Assets públicos (index.html, manifest, íconos)
├── src/
│   ├── Components/         # Componentes UI reutilizables
│   │   ├── Icons.js        # Librería de íconos SVG personalizados
│   │   ├── FormularioProducto.js # Gestión de productos y variantes
│   │   └── ... (Modales, Carrito, Mapas)
│   ├── constants/          # Datos estáticos (Bancos, Categorías)
│   ├── context/            # Gestión de estado global
│   │   ├── TenantContext.js # Branding y configuración de la empresa
│   │   └── CartContext.js   # Gestión del carrito de compras
│   ├── hooks/              # Lógica de React personalizada
│   ├── services/           # Integración con Backend (Supabase)
│   ├── utils/              # Helpers (Formateo, Tiempo, Geolocalización)
│   ├── views/              # Vistas basadas en roles
│   │   ├── SuperAdmin/     # Gestión de empresas (SaaS)
│   │   ├── Admin/          # Gestión del local/sucursal
│   │   ├── Cliente/        # Menú digital y seguimiento
│   │   ├── Delivery/       # Panel para repartidores
│   │   └── Login/          # Autenticación multi-tenant
│   ├── App.js              # Enrutador principal y configuración
│   ├── index.js            # Punto de entrada de React
│   └── tenant.config.js    # Configuración de inicialización de Tenants
├── .env.example            # Plantilla de variables de entorno
├── SUPABASE_SETUP.sql      # Script de base de datos para Supabase
├── tailwind.config.js      # Configuración de estilos y temas
└── DOCUMENTACION.md        # Resumen de arquitectura v2.0
```

## 🛠️ Tecnologías y Dependencias

### Core

- **React 19**: Framework de UI.
- **Tailwind CSS**: Para estilos dinámicos y branding.
- **React Router Dom v7**: Gestión de rutas.

### Librerías Clave (Necesarias para instalar)

Para replicar el entorno, ejecuta:

```bash
npm install @supabase/supabase-js leaflet react-leaflet leaflet-routing-machine qrcode.react lucide-react framer-motion
```

**Detalle de paquetes principales:**

- `@supabase/supabase-js`: Cliente para la base de datos y auth.
- `leaflet` & `react-leaflet`: Mapas para geolocalización de pedidos.
- `qrcode.react`: Generación de códigos QR para las mesas/locales.
- `tailwind-merge` & `clsx`: Utilidades para manejo de clases CSS dinámicas.

## 🚀 Pasos para la Replicación

### 1. Clonar e Instalar

```bash
git clone <url-del-repositorio>
cd fast-food
npm install
```

### 2. Configuración de Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta el contenido de `SUPABASE_SETUP.sql` en el SQL Editor de Supabase para crear las tablas (`tenants`, `orders`, `products`, etc.).

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz basado en `.env.example`:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-aqui
REACT_APP_TENANT_ID=tu-id-de-prueba
```

### 4. Ejecución Local

```bash
npm start
```

La app estará disponible en `http://localhost:3000`. Para acceder al panel de control global, navega a `/#/superadmin`.

---

_Nota: Esta guía refleja el estado actual de la migración a Supabase y la arquitectura modular v2.0._
