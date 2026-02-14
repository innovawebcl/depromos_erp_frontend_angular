import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { ModuleGuard } from '@infra-adapters/guards/module.guard';
import { AuthGuard } from '@infra-adapters/guards/auth.guard';
import { InvalidSessionGuard } from '@infra-adapters/guards/invalidSession.guard';
import { RoleGuard } from '@infra-adapters/guards/role.guard';
import { UserRole } from '@core-interfaces/global';
import { InstitutionResolver } from '@infra-adapters/resolver/institution.resolver';
import { FirstLoginGuard } from '@infra-adapters/guards/firstLogin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home',
    },
    resolve: { institutions: InstitutionResolver },
    canActivate: [AuthGuard, FirstLoginGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'products',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'products' },
        loadChildren: () =>
          import('./views/products/routes').then((m) => m.routes),
      },
      {
        path: 'inventory',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'inventory' },
        loadChildren: () =>
          import('./views/inventory/routes').then((m) => m.routes),
      },
      {
        path: 'banners',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'banners' },
        loadChildren: () =>
          import('./views/banners/routes').then((m) => m.routes),
      },
      {
        path: 'couriers',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'couriers' },
        loadChildren: () =>
          import('./views/couriers/routes').then((m) => m.routes),
      },
      {
        path: 'communes',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'communes' },
        loadChildren: () =>
          import('./views/communes/routes').then((m) => m.routes),
      },
      {
        path: 'customers',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'customers' },
        loadChildren: () =>
          import('./views/customers/routes').then((m) => m.routes),
      },
      {
        path: 'orders',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'orders' },
        loadChildren: () =>
          import('./views/orders/routes').then((m) => m.routes),
      },
      {
        path: 'picking',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'picking' },
        loadChildren: () =>
          import('./views/picking/routes').then((m) => m.routes),
      },
      {
        path: 'users',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'users' },
        loadChildren: () =>
          import('./views/users/routes').then((m) => m.routes),
      },
      {
        path: 'roles',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'roles' },
        loadChildren: () =>
          import('./views/roles/routes').then((m) => m.routes),
      },
      {
        path: 'profile',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Teacher, UserRole.Student] },
        loadChildren: () =>
          import('./views/profile/routes').then((m) => m.routes),
      },
      {
        path: 'institutions',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SuperAdministrator, UserRole.Administrator] },
        loadChildren: () =>
          import('./views/institution/routes').then((m) => m.routes),
      },
      {
        path: 'sociograms',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.SuperAdministrator,
            UserRole.Administrator,
            UserRole.Teacher,
          ],
        },
        loadChildren: () =>
          import('./views/sociogram/routes').then((m) => m.routes),
      },
      {
        path: 'courses',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.SuperAdministrator,
            UserRole.Administrator,
            UserRole.Teacher,
          ],
        },
        loadChildren: () =>
          import('./views/course/routes').then((m) => m.routes),
      },
      {
        path: 'teachers',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SuperAdministrator, UserRole.Administrator] },
        loadChildren: () =>
          import('./views/teacher/routes').then((m) => m.routes),
      },
      {
        path: 'students',
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.SuperAdministrator,
            UserRole.Administrator,
            UserRole.Student,
            UserRole.Teacher,
          ],
        },
        loadChildren: () =>
          import('./views/student/routes').then((m) => m.routes),
      },
      {
        path: 'complaints',
        runGuardsAndResolvers: 'always',
        loadChildren: () =>
          import('./views/complaint/routes').then((m) => m.routes),
        canActivate: [RoleGuard],
        data: {
          roles: [
            UserRole.Teacher,
            UserRole.Student,
            UserRole.Administrator,
            UserRole.SuperAdministrator,
          ],
        },
      },
      {
        path: 'investigation',
        loadChildren: () =>
          import('./views/investigation/routes').then((m) => m.routes),
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Administrator],
        },
      },
      {
        path: 'admins',
        loadChildren: () => import('./views/user/routes').then((m) => m.routes),
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Administrator, UserRole.SuperAdministrator],
        },
      },
      {
        path: 'positivereinforcement',
        loadChildren: () =>
          import('./views/positive-reinforcement/routes').then((m) => m.routes),
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.Administrator, UserRole.Teacher, UserRole.Student],
        },
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component
      ),
    data: {
      title: 'Page 404',
    },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component
      ),
    data: {
      title: 'Page 500',
    },
  },
  {
    path: 'login',
    canActivate: [InvalidSessionGuard],
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Iniciar Sesión',
    },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Forgot Password Page',
    },
  },
  {
    path: 'validate-code',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Validate Code Page',
    },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
      canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '404' },
];
