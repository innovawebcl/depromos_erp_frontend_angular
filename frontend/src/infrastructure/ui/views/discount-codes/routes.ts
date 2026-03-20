import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./discount-codes-list.component').then(m => m.DiscountCodesListComponent),
    data: { title: 'Códigos de Descuento' },
  },
  {
    path: 'new',
    loadComponent: () => import('./discount-codes-form.component').then(m => m.DiscountCodesFormComponent),
    data: { title: 'Nuevo Código' },
  },
  {
    path: ':id',
    loadComponent: () => import('./discount-codes-form.component').then(m => m.DiscountCodesFormComponent),
    data: { title: 'Editar Código' },
  },
];
