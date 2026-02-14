import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    loadComponent: () =>
      import('./user.component').then((m) => m.UserComponent),
    data: {
      roles: [UserRole.SuperAdministrator, UserRole.Administrator],
      title: 'Administradores',
    },
    children: [
      {
        path: '',
/*         canActivate: [RoleGuard],
 */        loadComponent: () =>
          import('./user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
        data: {
/*           roles: [UserRole.SuperAdministrator, UserRole.Administrator],
 */          title: 'Listados',
        },
      },
      {
        path: 'store',
/*         canActivate: [RoleGuard],
 */        loadComponent: () =>
          import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
        data: {
/*           roles: [UserRole.SuperAdministrator, UserRole.Administrator],
 */          title: 'Registrar',
        },
      },
      {
        path: 'update',
/*         canActivate: [RoleGuard],
 */        loadComponent: () =>
          import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
        data: {
/*           roles: [UserRole.SuperAdministrator, UserRole.Administrator],
 */          title: 'Modificar',
        },
      },
    ],
  },
];
