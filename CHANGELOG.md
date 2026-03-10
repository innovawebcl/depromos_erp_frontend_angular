# Changelog - Depromos ERP Frontend

Todas las versiones notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Semantic Versioning](https://semver.org/lang/es/).

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
