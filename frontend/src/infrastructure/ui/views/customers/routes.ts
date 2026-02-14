import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./customers-list.component').then(m => m.CustomersListComponent), data: { title: 'Clientes' } },
  { path: ':id', loadComponent: () => import('./customers-detail.component').then(m => m.CustomersDetailComponent), data: { title: 'Detalle cliente' } },
];
