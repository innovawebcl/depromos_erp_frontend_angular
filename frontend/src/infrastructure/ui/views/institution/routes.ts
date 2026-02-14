import { Routes } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { RoleGuard } from '@infra-adapters/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./institution.component').then((m) => m.InstitutionComponent),
    data: {
      title: 'Institución',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./list-institution/list-institution.component').then(
            (m) => m.ListInstitutionComponent
          ),
        canActivate: [RoleGuard],
        data: {
          title: 'Listados',
          roles: [UserRole.SuperAdministrator],
        },
      },
      {
        path: 'store',
        loadComponent: () =>
          import('./form-institution/form-institution.component').then(
            (m) => m.FormInstitutionComponent
          ),
        canActivate: [RoleGuard],
        data: {
          title: 'Registrar',
          roles: [UserRole.SuperAdministrator],
        },
      },
      {
        path: 'update',
        loadComponent: () =>
          import('./form-institution/form-institution.component').then(
            (m) => m.FormInstitutionComponent
          ),
          canActivate: [RoleGuard],
        data: {
          title: 'Modificar',
          roles: [UserRole.SuperAdministrator],
        },
      },
      {
        path: 'annotation-level',
        loadComponent: () =>
          import(
            './annotation-level-config/annotation-level-config.component'
          ).then((m) => m.AnnotationLevelConfigComponent),
        canActivate: [RoleGuard],
        data: {
          title: 'Listado de Niveles de Anotación',
          roles: [UserRole.SuperAdministrator],
        },
      },
      {
        path: 'annotation-level/subcategories/update',
        loadComponent: () =>
          import(
            './annotation-level-subcategories-form/annotation-level-subcategories-form.component'
          ).then((m) => m.AnnotationLevelCategoriesFormComponent),
        canActivate: [RoleGuard],
        data: {
          title: 'Listado de Niveles de Anotación',
          roles: [UserRole.SuperAdministrator],
        },
      },
      {
        path: 'annotation-levels/store',
        loadComponent: () =>
          import(
            './annotation-level-config-form/annotation-level-config-form.component'
          ).then((m) => m.AnnotationLevelConfigFormComponent),
        canActivate: [RoleGuard],
        data: {
          title: 'Registrar Nivel de Anotación',
          roles: [UserRole.SuperAdministrator],
        },
      },
      {
        path: 'annotation-levels/update',
        loadComponent: () =>
          import(
            './annotation-level-config-form/annotation-level-config-form.component'
          ).then((m) => m.AnnotationLevelConfigFormComponent),
        canActivate: [RoleGuard],
        data: {
          title: 'Modificar Nivel de Anotación',
          roles: [UserRole.SuperAdministrator],
        },
      },
    
      
    ],
  },
];
