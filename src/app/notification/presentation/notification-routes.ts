import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const notificationList = () =>
  import('./views/notification-list/notification-list').then((m) => m.NotificationList);

const notificationRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'notification-list', loadComponent: notificationList },
      { path: '', redirectTo: 'notification-list', pathMatch: 'full' },
    ],
  },
];

export { notificationRoutes };
