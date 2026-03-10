# Changelog - Depromos ERP Frontend

Todas las versiones notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Semantic Versioning](https://semver.org/lang/es/).

## [1.2.0] - 2026-03-10

Infraestructura de contenedores para producción y desarrollo.

### Dockerfile Producción
- Multi-stage build: Node 20-alpine (build) → Nginx 1.25-alpine (serve)
- Angular app compilada a estáticos servidos por Nginx
- Non-root user (nginx) para seguridad
- Healthcheck integrado
- Output path consistente: `dist/depromos-erp/browser`

### Dockerfile Desarrollo
- `Dockerfile.dev` con Node 20-alpine y Angular CLI hot-reload
- `docker-compose.yml` standalone para desarrollo frontend (puerto 4200)
- Volume mounts para `src/` y `angular.json`

### Nginx
- Proxy reverso `/api/*` → `api:8000` (backend Laravel)
- SPA fallback (`try_files $uri $uri/ /index.html`)
- Gzip level 6 para JS, CSS, JSON, SVG
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Cache agresivo (1 año, immutable) para assets hasheados
- Denegación de acceso a archivos ocultos

### Environments
- `environment.production.ts`: `apiUrl` cambiado a `/api` (relativo, proxy nginx)
- `environment.staging.ts`: `apiUrl` cambiado a `/api` (relativo, proxy nginx)
- `.dockerignore` para excluir node_modules, dist, .angular del build

---

## [1.1.0] - 2026-03-10

Alineación completa del frontend con backend v1.2.0. Corrección de inconsistencias críticas en endpoints, contratos de datos, auth flow y eliminación de código muerto sin backend.

### Correcciones Críticas
- **C1:** URLs de picking service corregidas (`/picking-sessions` → `/picking`)
- **C2:** Eliminados componentes forgot-password, validate-code, reset-password (sin endpoints en backend)
- **C3:** Interfaces User actualizadas con `first_name`, `last_name`, `username`, `role` como objeto
- **C5:** UserRole enum alineado con JWT claims del backend (`role: 'admin'`)

### Mejoras de Consistencia
- **C4:** Formulario y listado de usuarios con campos username, first_name, last_name
- **C6:** auth.service mejorado con `isLoggedIn()`, verificación de expiración JWT, `getModules()`
- **A1:** Interfaces DeliveryAddress, Payment, StatusHistoryEntry agregadas a orders.models.ts
- **A3:** Alias de environment unificado (`@infra-environments` → `@infra-env`), alias duplicado eliminado de tsconfig
- **M2:** Toggle de comunas implementado en communes-list

### Limpieza
- 9 archivos eliminados (componentes sin backend)
- 23 archivos modificados
- Última referencia a ConvivePro eliminada (alt text en layout)
- Login simplificado: solo formulario de autenticación
- Interfaces de login limpiadas (IForgotPasswordInput, IValidateCodeInput, IResetPasswordInput eliminadas)

---

## [1.0.0] - 2026-03-10

Primera versión estable post-refactorización. Eliminación completa del código legacy de ConvivePro y optimización de dependencias.

### Arquitectura
- Angular 17 con Clean Architecture: Core (interfaces/ports) → Application (services) → Infrastructure (adapters/UI)
- Standalone components (sin NgModules)
- Lazy loading por módulo vía app.routes.ts
- Navegación dinámica construida desde permisos del backend (buildBackofficeNav)
- Guards: auth, invalidSession, module
- Interceptors: auth (JWT), authError (401/403), message (notificaciones)

### Módulos ERP
- **Dashboard:** Panel principal limpio con métricas del backoffice
- **Productos:** Listado y gestión con tallas e inventario
- **Banners:** CRUD con preview de imágenes
- **Pedidos:** Listado con filtros por estado y detalle completo
- **Picking:** Interfaz de escaneo de ítems
- **Repartidores:** Gestión con calificaciones
- **Tarifas por Comuna:** Gestión con histórico de tarifas
- **Clientes:** Listado, detalle, blacklist y meta de compras
- **Usuarios:** CRUD con activación/desactivación
- **Roles y Permisos:** Gestión de roles con asignación de módulos
- **Login:** Autenticación JWT con manejo de sesión

### Limpieza de Código Legacy (ConvivePro)
- Eliminados ~200 archivos de módulos legacy (sociogramas, cursos, profesores, denuncias, investigaciones, refuerzos positivos, instituciones, anotaciones)
- Eliminados 12 services legacy no utilizados
- Eliminados 5 pipes legacy (FilteredCourses, TranslateAnnotationLevel, etc.)
- Eliminados componentes legacy: SelectorInstitution, EmailLayout, QuillCounter, DashboardGadgets
- Eliminadas interfaces y ports del dominio educativo
- Limpiada navegación: eliminados navStudents, navTeachers, navAdministrator
- Limpiado auth.service.ts: eliminados métodos de institution
- Limpiado global/index.ts: eliminados enums UserRole y StorageKeys legacy

### Optimización de Dependencias
- Eliminadas 7 dependencias no utilizadas: date-fns (37MB), lodash-es, chart.js, @coreui/chartjs, @coreui/angular-chartjs, @coreui/utils, ngx-file-drop
- Eliminados @types/jest, @types/mocha, @types/lodash-es (proyecto usa Jasmine/Karma)
- Movido @angular/language-service a devDependencies
- Reducción de node_modules: 525 MB → 444 MB (-15%)

### Rebranding
- Proyecto renombrado en angular.json: convivepro → depromos-erp
- Output path: dist/convivepro → dist/depromos-erp
- Environments actualizados: URLs de convivepro.cl eliminadas
- index.html, footer, app.component.ts: branding Depromos ERP
- package.json: nombre y descripción actualizados
- Icon subset limpiado (6 iconos legacy removidos)
