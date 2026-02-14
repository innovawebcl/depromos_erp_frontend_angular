import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-list.component').then(m => m.ProductsListComponent),
    data: { title: 'Productos' },
  },
  {
    path: 'new',
    loadComponent: () => import('./products-form.component').then(m => m.ProductsFormComponent),
    data: { title: 'Nuevo Producto' },
  },
  {
    path: ':id',
    loadComponent: () => import('./products-form.component').then(m => m.ProductsFormComponent),
    data: { title: 'Editar Producto' },
  },
];
