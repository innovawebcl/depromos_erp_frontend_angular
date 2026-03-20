import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { ModuleGuard } from '@infra-adapters/guards/module.guard';
import { AuthGuard } from '@infra-adapters/guards/auth.guard';
import { InvalidSessionGuard } from '@infra-adapters/guards/invalidSession.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: { title: 'Home' },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'brands',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'brands' },
        loadChildren: () =>
          import('./views/brands/routes').then((m) => m.routes),
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
        path: 'discount-codes',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'discount_codes' },
        loadChildren: () =>
          import('./views/discount-codes/routes').then((m) => m.routes),
      },
      {
        path: 'push-notifications',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'notifications' },
        loadChildren: () =>
          import('./views/push-notifications/routes').then((m) => m.routes),
      },
      {
        path: 'roles',
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'roles' },
        loadChildren: () =>
          import('./views/roles/routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component
      ),
    data: { title: 'Page 404' },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component
      ),
    data: { title: 'Page 500' },
  },
  {
    path: 'login',
    canActivate: [InvalidSessionGuard],
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: { title: 'Iniciar Sesión' },
  },

  { path: '**', redirectTo: '404' },
];
