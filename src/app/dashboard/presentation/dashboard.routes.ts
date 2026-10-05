import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const dashboard = () =>
  import('./views/dashboard/dashboard').then((m) => m.Dashboard);

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', loadComponent: dashboard },
    ],
  },
];
