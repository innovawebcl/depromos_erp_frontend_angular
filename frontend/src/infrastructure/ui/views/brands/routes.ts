import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./brands-list.component').then(m => m.BrandsListComponent),
    data: { title: 'Marcas' },
  },
  {
    path: 'new',
    loadComponent: () => import('./brands-form.component').then(m => m.BrandsFormComponent),
    data: { title: 'Nueva marca' },
  },
  {
    path: ':id',
    loadComponent: () => import('./brands-form.component').then(m => m.BrandsFormComponent),
    data: { title: 'Editar marca' },
  },
];
