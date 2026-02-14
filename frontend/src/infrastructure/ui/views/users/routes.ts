import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./users-list.component').then((m) => m.UsersListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./users-form.component').then((m) => m.UsersFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./users-form.component').then((m) => m.UsersFormComponent),
  },
];
