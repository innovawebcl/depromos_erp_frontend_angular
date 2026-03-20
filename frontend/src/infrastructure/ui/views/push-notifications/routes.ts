import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./push-notifications-list.component').then(m => m.PushNotificationsListComponent),
    data: { title: 'Notificaciones Push' },
  },
  {
    path: 'new',
    loadComponent: () => import('./push-notifications-form.component').then(m => m.PushNotificationsFormComponent),
    data: { title: 'Nueva Notificación' },
  },
  {
    path: ':id',
    loadComponent: () => import('./push-notifications-form.component').then(m => m.PushNotificationsFormComponent),
    data: { title: 'Editar Notificación' },
  },
];
