import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./roles-list.component').then((m) => m.RolesListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./roles-form.component').then((m) => m.RolesFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./roles-form.component').then((m) => m.RolesFormComponent),
  },
];
