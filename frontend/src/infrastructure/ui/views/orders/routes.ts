import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./orders-list.component').then((m) => m.OrdersListComponent),
    data: { title: 'Pedidos' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./orders-detail.component').then((m) => m.OrdersDetailComponent),
    data: { title: 'Detalle pedido' },
  },
];
