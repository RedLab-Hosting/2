# 🚀 Guía de Replicación - Prysma Platform

Esta guía detalla todo lo necesario para replicar la estructura, dependencias y configuración de la aplicación multi-tenant.

## 📁 Estructura del Proyecto

```text
demo-page/
├── .github/workflows/deploy.yml  # CI/CD para GitHub Pages
├── public/assets/                 # Logos, iconos, branding
├── src/
│   ├── api/                       # 8 servicios (Supabase, GitHub, BCV)
│   ├── components/
│   │   ├── Admin/                 # ProductModal (crear/editar productos)
│   │   ├── Client/                # ProductCard, ProductModal (cliente)
│   │   └── Common/                # ErrorBoundary
│   ├── context/                   # TenantContext, AuthContext, CartContext
│   ├── utils/                     # featureFlags, whatsappUtils
│   ├── views/
│   │   ├── SuperAdmin/            # Panel de control de franquicias
│   │   ├── Admin/                 # Dashboard del negocio
│   │   ├── Client/                # Storefront + Checkout
│   │   └── Login/                 # LoginView
│   ├── App.jsx                    # Router con basename dinámico
│   ├── main.jsx                   # Punto de entrada
│   └── index.css                  # Tailwind v4 imports
├── .env                           # Variables de entorno (VITE_ prefix)
├── SUPABASE_SETUP.sql             # Script de base de datos idempotente
├── vite.config.js                 # base: './' para GitHub Pages
└── package.json
```

## 🛠️ Dependencias

### Instalar todo:
```bash
npm install
```

### Dependencias principales:
- `react`, `react-dom` (v19)
- `react-router-dom` (v7)
- `@supabase/supabase-js`
- `@tailwindcss/vite` (v4)
- `framer-motion`, `lucide-react`
- `leaflet`, `react-leaflet`, `leaflet-routing-machine`
- `libsodium-wrappers`, `qrcode.react`

## 🚀 Pasos para Replicar

### 1. Clonar e instalar
```bash
git clone https://github.com/RedLab-Hosting/prysma.git
cd prysma
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta `SUPABASE_SETUP.sql` en el SQL Editor.

### 3. Variables de entorno
Crea un archivo `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GITHUB_TOKEN=tu-github-pat
```

### 4. Ejecución local
```bash
npm run dev
```
Disponible en `http://localhost:5173/superadmin`

### 5. Despliegue automático
Al crear una empresa desde el SuperAdmin:
1. Se genera un repo desde el template `prysma`
2. Se inyectan los secretos de Supabase automáticamente
3. Se activa GitHub Pages (source: Actions)
4. Se dispara el primer build

---

_Actualizado: 2026-03-25_
