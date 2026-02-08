import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'explore',
    pathMatch: 'full',
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./features/explore/pages/explore.page').then(m => m.ExplorePage),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'wcs',
    loadChildren: () =>
      import('./features/wcs/wcs.routes').then(m => m.WCS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'explore',
  },
];
