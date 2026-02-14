import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./picking-queue.component').then((m) => m.PickingQueueComponent),
    data: { title: 'Picking' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./picking-session.component').then((m) => m.PickingSessionComponent),
    data: { title: 'Picking pedido' },
  },
];
