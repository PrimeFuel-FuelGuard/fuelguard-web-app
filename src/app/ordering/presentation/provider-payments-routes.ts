import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

/** Ruta de pagos del distribuidor; se monta en `/payments` con `providerGuard` (ver `app.routes.ts`). */
export const providerPaymentRoutes: Routes = [{
  path: '', component: Layout, children: [
    { path: '', loadComponent: () => import('./views/provider-payments/provider-payments').then((m) => m.ProviderPayments) },
  ],
}];
