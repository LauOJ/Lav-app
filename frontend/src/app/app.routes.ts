import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'wcs',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login.page').then(m => m.LoginPage),
  },
  {
    path: 'wcs',
    loadChildren: () =>
      import('./features/wcs/wcs.routes').then(m => m.WCS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'wcs',
  },
];
