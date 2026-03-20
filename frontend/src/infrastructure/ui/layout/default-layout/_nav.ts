import type { INavData } from '@coreui/angular-pro';

// ------------------------------
// Depromos ERP – Backoffice NAV
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
    key: 'discount_codes',
    item: { name: 'Códigos Descuento', url: '/discount-codes', iconComponent: { name: 'cil-gift' } },
  },
  {
    key: 'notifications',
    item: { name: 'Notificaciones', url: '/push-notifications', iconComponent: { name: 'cil-bell' } },
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
