import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./student.component').then((m) => m.StudentComponent),
    data: {
      title: 'Estudiantes',
    },
    children: [
      {
        path: '',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator, UserRole.Administrator],
          title: 'Listados',
        },
        loadComponent: () =>
          import('./list-student/list-student.component').then(
            (m) => m.ListStudentComponent
          ),
      },
      {
        path: 'store',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator, UserRole.Administrator],
          title: 'Registrar',
        },
        loadComponent: () =>
          import('./form-student/form-student.component').then(
            (m) => m.FormStudentComponent
          ),
      },
      {
        path: 'update',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.SuperAdministrator, UserRole.Administrator],
          title: 'Modificar',
        },
        loadComponent: () =>
          import('./form-student/form-student.component').then(
            (m) => m.FormStudentComponent
          ),
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
      {
        path: 'sociograms',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Student],
          title: 'Sociogramas',
        },
        loadComponent: () =>
          import('./sociogram-list/sociogram-list.component').then(
            (m) => m.SociogramListComponent
          ),
      },
      {
        path: 'answer/sociograms',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Student],
          title: 'Responder Sociograma',
        },
        loadComponent: () =>
          import('./sociogram-form/sociogram-form.component').then(
            (m) => m.SociogramFormComponent
          ),
      },
      {
        path: ':id/profile',
        loadComponent: () =>
          import('./student-profile/student-profile.component').then(
            (m) => m.StudentProfileComponent
          ),
        data: {
          title: 'Perfil de estudiante',
        },
      },
      {
        path: ':id/annotations/store',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Teacher, UserRole.Administrator],
          title: 'Registrar Anotación',
        },
        loadComponent: () =>
          import('./annotation-form/annotation-form.component').then(
            (m) => m.AnnotationFormComponent
          ),
      },
      {
        path: ':id/interviews/store',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Teacher, UserRole.Administrator],
          title: 'Registrar Entrevista',
        },
        loadComponent: () =>
          import('./interview-form/interview-form.component').then(
            (m) => m.InterviewFormComponent
          ),
      },
      {
        path: 'interviews/:id',
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Student, UserRole.Teacher, UserRole.Administrator],
          title: 'Detalle de Entrevista',
        },
        loadComponent: () =>
          import('./interview-detail/interview-detail.component').then(
            (m) => m.InterviewDetailComponent
          ),
      },
    ],
  },
];
