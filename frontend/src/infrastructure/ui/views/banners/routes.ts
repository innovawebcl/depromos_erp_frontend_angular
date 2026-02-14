import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./banners-list.component').then(m => m.BannersListComponent), data: { title: 'Banners' } },
  { path: 'new', loadComponent: () => import('./banners-form.component').then(m => m.BannersFormComponent), data: { title: 'Nuevo Banner' } },
  { path: ':id', loadComponent: () => import('./banners-form.component').then(m => m.BannersFormComponent), data: { title: 'Editar Banner' } },
];
