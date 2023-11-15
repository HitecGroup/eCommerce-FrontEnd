import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const rootRouterConfig: Routes = [
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule),
        data: { title: 'Session'}
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    //canActivate: [AuthGuard],
    children: [
      {
        path: 'shop',
        loadChildren: () => import('./views/shop/shop.module').then(m => m.ShopModule),
        data: { title: '', breadcrumb: 'SHOP'}
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'sessions/404'
  }
];

