import { Routes } from '@angular/router';
import { AdministratorRole, UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./complaint.component').then((m) => m.ComplaintComponent),
    data: {
      title: 'Denuncia',
    },
    children: [
      {
        path: '',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Administrator, UserRole.Teacher, UserRole.Student],
          title: 'Listado',
        },
        loadComponent: () =>
          import('./list-complaint/list-complaint.component').then(
            (m) => m.ListComplaintComponent
          ),
      },
      {
        path: 'store',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.Teacher,
            UserRole.Student,
            AdministratorRole.SchoolSupervisor,
          ],
          title: 'Registrar',
        },
        loadComponent: () =>
          import('./form-complaint/form-complaint.component').then(
            (m) => m.FormComplaintComponent
          ),
      },
    ],
  },
];
