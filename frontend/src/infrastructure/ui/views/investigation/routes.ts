import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./investigation.component').then((m) => m.InvestigationComponent),
    data: {
      title: 'Investigación',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./investigation-list/investigation-list.component').then(
            (m) => m.InvestigationListComponent
          ),
        canActivate: [RoleGuard],
        data: {
          title: '',
          roles: [UserRole.Administrator],
        },
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            './investigation-init-form/investigation-init-form.component'
          ).then((m) => m.InvestigationInitFormComponent),
        canActivate: [RoleGuard],
        data: {
          title: 'Nueva Investigación',
          roles: [UserRole.Administrator],
        },
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './investigation-detail/investigation-detail.component'
          ).then((m) => m.InvestigationDetailComponent),
        canActivate: [RoleGuard],
        data: {
          title: 'Detalle de Investigación',
          roles: [UserRole.Administrator],
        },
      },
    ],
  },
];
