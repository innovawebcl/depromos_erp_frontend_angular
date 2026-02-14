import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

// TODO agregar accesos por rol
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sociogram.component').then((m) => m.SociogramComponent),
    data: {
      title: 'Sociograma',
    },
    children: [
      {
        path: '',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.SuperAdministrator,
            UserRole.Administrator,
            UserRole.Teacher,
          ],
          title: 'Listados',
        },
        loadComponent: () =>
          import('./list-sociogram/list-sociogram.component').then(
            (m) => m.ListSociogramComponent
          ),
      },
      {
        path: 'store',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator],
          title: 'Registrar',
        },
        loadComponent: () =>
          import('./form-sociogram/form-sociogram.component').then(
            (m) => m.FormSociogramComponent
          ),
      },
      {
        path: 'update',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator],
          title: 'Modificar',
        },
        loadComponent: () =>
          import('./form-sociogram/form-sociogram.component').then(
            (m) => m.FormSociogramComponent
          ),
      },
      {
        path: 'courses',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator, UserRole.Administrator],
          title: 'Cursos',
        },
        loadComponent: () =>
          import('./courses-sociogram/courses-sociogram.component').then(
            (m) => m.CoursesSociogramComponent
          ),
      },
      {
        path: 'institutions',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator],
          title: 'Instituciones',
        },
        loadComponent: () =>
          import(
            './institutions-sociograms/institutions-sociograms.component'
          ).then((m) => m.InstitutionsSociogramsComponent),
      },
      {
        path: 'report',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.SuperAdministrator,
            UserRole.Administrator,
            UserRole.Teacher,
          ],
          title: 'Reportes',
        },
        loadComponent: () =>
          import('./report-sociogram/report-sociogram.component').then(
            (m) => m.ReportSociogramComponent
          ),
      },
    ],
  },
];
