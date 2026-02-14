import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./inventory.component').then(m => m.InventoryComponent), data: { title: 'Inventario' } },
];
