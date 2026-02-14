import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./course.component').then((m) => m.CourseComponent),
    data: {
      title: 'Curso',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./list-course/list-course.component').then(
            (m) => m.ListCourseComponent
          ),
        data: {
          title: 'Listados',
        },
      },
      {
        path: 'store',
        canActivate: [RoleGuard],
        loadComponent: () =>
          import('./form-course/form-course.component').then(
            (m) => m.FormCourseComponent
          ),
        data: {
          roles: [UserRole.SuperAdministrator],
          title: 'Registrar',
        },
      },
      {
        path: 'update',
        canActivate: [RoleGuard],
        loadComponent: () =>
          import('./form-course/form-course.component').then(
            (m) => m.FormCourseComponent
          ),
        data: {
          roles: [UserRole.SuperAdministrator],
          title: 'Modificar',
        },
      },
      {
        path: ':id/annotations/store',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.Teacher,
            UserRole.Administrator
          ],
          title: 'Registrar Anotación',
        },
        loadComponent: () =>
          import('../student/annotation-form/annotation-form.component').then(
            (m) => m.AnnotationFormComponent
          ),
      },
    ],
  },
];
