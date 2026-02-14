import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./couriers-list.component').then(m => m.CouriersListComponent), data: { title: 'Repartidores' } },
  { path: 'new', loadComponent: () => import('./couriers-form.component').then(m => m.CouriersFormComponent), data: { title: 'Nuevo Repartidor' } },
  { path: ':id', loadComponent: () => import('./couriers-form.component').then(m => m.CouriersFormComponent), data: { title: 'Editar Repartidor' } },
  { path: ':id/ratings', loadComponent: () => import('./couriers-ratings.component').then(m => m.CouriersRatingsComponent), data: { title: 'Calificaciones' } },
];
