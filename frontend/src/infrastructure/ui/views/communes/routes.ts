import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./communes-list.component').then(m => m.CommunesListComponent), data: { title: 'Tarifas por comuna' } },
  { path: ':id', loadComponent: () => import('./communes-detail.component').then(m => m.CommunesDetailComponent), data: { title: 'Histórico de tarifas' } },
];
