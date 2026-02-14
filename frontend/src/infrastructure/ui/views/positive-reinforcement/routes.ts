import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./positive-reinforcement.component').then(
        (m) => m.PositiveReinforcementComponent
      ),
    data: {
      title: 'Refuerzo Positivo',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './positive-reinforcement-list/positive-reinforcement-list.component'
          ).then((m) => m.PositiveReinforcementListComponent),
          canActivate: [RoleGuard],
          data: {
            roles: [UserRole.Administrator, UserRole.Teacher, UserRole.Student],
          },
      },
      {
        path: 'store',
        loadComponent: () =>
          import(
            './positive-reinforcement-form/positive-reinforcement-form.component'
          ).then((m) => m.PositiveReinforcementFormComponent),
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Student],
        },
      },
    ],
  },
];
