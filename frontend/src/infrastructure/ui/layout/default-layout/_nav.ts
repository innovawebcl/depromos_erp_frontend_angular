import type { INavData } from '@coreui/angular-pro';

const Common: INavData[] = [
  {
    name: 'Administradores',
    url: '/admins',
    iconComponent: { name: 'cil-people' },
  },
  {
    name: 'Sociogramas',
    url: '/sociograms',
    iconComponent: { name: 'cil-notes' }, // Icono relacionado con educación o cursos
  },
  {
    name: 'Cursos',
    url: '/courses',
    iconComponent: { name: 'cil-school' }, // Icono relacionado con educación o cursos
  },
  {
    name: 'Profesores',
    url: '/teachers',
    iconComponent: { name: 'cil-people' }, // Icono relacionado con personas o equipo
  },
  {
    name: 'Estudiantes',
    url: '/students',
    iconComponent: { name: 'cil-user' }, // Icono relacionado con un usuario individual
  },
];

export const navSuperAdministrator: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-chart' }, // Icono relacionado con estadísticas y métricas
  },
  {
    name: 'Instituciones',
    url: '/institutions',
    iconComponent: { name: 'cil-institution' }, // Icono relacionado con instituciones o edificios
  },
  ...Common,
  {
    name: 'Etiquetas de anotaciones',
    url: '/institutions/annotation-level',
    iconComponent: { name: 'cil-notes' },
  }
];

export const navAdministrator: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-chart' }, // Icono relacionado con estadísticas y métricas
  },
  ...Common,
  {
    name: 'Refuerzo Positivo',
    url: '/positivereinforcement',
    iconComponent: { name: 'cil-check' }, // Icono relacionado con un usuario individual
  },
  {
    name: 'Denuncias',
    url: '/complaints',
    iconComponent: { name: 'cil-report-slash' },
  },
  {
    name: 'Investigaciones',
    url: '/investigation',
    iconComponent: { name: 'cil-search' },
  },
];

export const navStudents: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-chart' },
  },
  {
    name: 'Sociogramas',
    url: '/students/sociograms',
    iconComponent: { name: 'cil-notes' }, // Icono relacionado con un usuario individual
  },
  {
    name: 'Refuerzo Positivo',
    url: '/positivereinforcement',
    iconComponent: { name: 'cil-check' }, // Icono relacionado con un usuario individual
  },
  {
    name: 'Mis denuncias',
    url: '/complaints',
    iconComponent: { name: 'cil-spreadsheet' },
  },
  {
    name: 'Mi perfil',
    url: '/profile',
    iconComponent: { name: 'cil-user' },
  },
];

export const navTeachers: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-chart' },
  },
  {
    name: 'Cursos',
    url: '/courses',
    iconComponent: { name: 'cil-school' }, // Icono relacionado con educación o cursos
  },
  {
    name: 'Sociogramas',
    url: '/sociograms',
    iconComponent: { name: 'cil-notes' }, // Icono relacionado con un usuario individual
  },
  {
    name: 'Refuerzo Positivo',
    url: '/positivereinforcement',
    iconComponent: { name: 'cil-check' }, // Icono relacionado con un usuario individual
  },
  {
    name: 'Mis denuncias',
    url: '/complaints',
    iconComponent: { name: 'cil-report-slash' },
  },
  {
    name: 'Mi perfil',
    url: '/profile',
    iconComponent: { name: 'cil-user' },
  },
];

export const navInspectors: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-chart' },
  },
  {
    name: 'Cursos',
    url: '/courses',
    iconComponent: { name: 'cil-school' }, // Icono relacionado con educación o cursos
  },
  {
    name: 'Refuerzo Positivo',
    url: '/positivereinforcement',
    iconComponent: { name: 'cil-check' }, // Icono relacionado con un usuario individual
  },
  {
    name: 'Denuncias',
    url: '/complaints/store',
    iconComponent: { name: 'cil-report-slash' },
  },
];

// ------------------------------
// Backoffice (e-commerce) NAV
// ------------------------------

const backofficeCatalog: { key: string; item: INavData }[] = [
  {
    key: 'dashboard',
    item: { name: 'Dashboard', url: '/dashboard', iconComponent: { name: 'cil-chart' } },
  },
  {
    key: 'products',
    item: { name: 'Productos', url: '/products', iconComponent: { name: 'cil-tags' } },
  },
  {
    key: 'inventory',
    item: { name: 'Inventario', url: '/inventory', iconComponent: { name: 'cil-layers' } },
  },
  {
    key: 'banners',
    item: { name: 'Banners', url: '/banners', iconComponent: { name: 'cil-image' } },
  },
  {
    key: 'orders',
    item: { name: 'Pedidos', url: '/orders', iconComponent: { name: 'cil-cart' } },
  },
  {
    key: 'picking',
    item: { name: 'Picking', url: '/picking', iconComponent: { name: 'cil-check' } },
  },
  {
    key: 'couriers',
    item: { name: 'Repartidores', url: '/couriers', iconComponent: { name: 'cil-bike' } },
  },
  {
    key: 'communes',
    item: { name: 'Tarifas por comuna', url: '/communes', iconComponent: { name: 'cil-map' } },
  },
  {
    key: 'customers',
    item: { name: 'Clientes', url: '/customers', iconComponent: { name: 'cil-user' } },
  },
  {
    key: 'users',
    item: { name: 'Usuarios', url: '/users', iconComponent: { name: 'cil-people' } },
  },
  {
    key: 'roles',
    item: { name: 'Roles y módulos', url: '/roles', iconComponent: { name: 'cil-settings' } },
  },
];

/**
 * Construye el menú del backoffice según modules{} del JWT.
 * Si modules es undefined/null, retorna el menú completo (modo demo).
 */
export function buildBackofficeNav(modules?: Record<string, boolean> | null): INavData[] {
  if (!modules) {
    return backofficeCatalog.map((x) => x.item);
  }
  // dashboard siempre visible
  const forced = new Set(['dashboard']);
  return backofficeCatalog
    .filter((x) => forced.has(x.key) || !!modules[x.key])
    .map((x) => x.item);
}
