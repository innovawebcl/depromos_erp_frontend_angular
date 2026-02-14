import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./teacher.component').then((m) => m.TeacherComponent),
    data: {
      title: 'Profesores',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./list-teacher/list-teacher.component').then(
            (m) => m.ListTeacherComponent
          ),
        data: {
          title: 'Listados',
        },
      },
      {
        path: 'store',
        loadComponent: () =>
          import('./form-teacher/form-teacher.component').then(
            (m) => m.FormTeacherComponent
          ),
        data: {
          title: 'Registrar',
        },
      },
      {
        path: 'update',
        loadComponent: () =>
          import('./form-teacher/form-teacher.component').then(
            (m) => m.FormTeacherComponent
          ),
        data: {
          title: 'Modificar',
        },
      },
      {
        path: ':id/profile',
        loadComponent: () =>
          import('./teacher-profile/teacher-profile.component').then(
            (m) => m.TeacherProfileComponent
          ),
        data: {
          title: 'Perfil de Profesor',
        }
      },
      {
        path: 'upload',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator, UserRole.Administrator],
          title: 'Carga Masiva',
        },
        loadComponent: () =>
          import('./bulk-upload/bulk-upload.component').then(
            (m) => m.BulkUploadComponent
          ),
      },
    ],
  },
];
