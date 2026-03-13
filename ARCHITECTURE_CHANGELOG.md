# Registro de Cambios y Arquitectura (Prysma)

Este documento registra las decisiones técnicas, cambios de base de datos y configuraciones de seguridad realizadas para la arquitectura multi-tenant de Prysma.

## 1. Arquitectura Core
- **Estructura Git**: Modelo Núcleo (`prysma`) -> Ramas (`empresa-x`).
- **Sincronización**: Actualizaciones heredadas vía remotos de Git (`upstream`).
- **Aislamiento**: Multi-tenancy compartido en una sola instancia de Supabase usando `tenant_id`.

## 2. Base de Datos (Supabase)
### Cambios en Esquema
- Adición de tabla `tenants` con soporte para temas, features y settings JSONB.
- Columna `custom_domain` añadida para soporte de dominios propios.
- Relación de `tenant_id` en todas las tablas operativas (pedidos, productos, perfiles).

### Seguridad (RLS)
- Implementación de **Row Level Security** en todas las tablas expuestas.
- Políticas de aislamiento: Los usuarios/clientes solo pueden acceder a datos de su propio `tenant_id`.

## 3. Seguridad Avanzada (Fixes)
- **RLS Enablement**: Activación de RLS en todas las tablas para que las políticas sean efectivas.
- **Security Definer Fix**: Corrección de la función `is_superadmin` con `SET search_path = public` para prevenir ataques de inyección de esquema.

## 4. Automatización
- **githubService**: Integración con la API de GitHub para crear repositorios automáticamente al registrar una nueva empresa.
- **TenantContext**: Detección dinámica de inquilinos mediante subdominios, dominios propios o links de GitHub Pages.
