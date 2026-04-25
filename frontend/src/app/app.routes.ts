import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';
import { authGuard } from './core/auth/auth.guard';

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
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wcs/pages/favorites.page').then(m => m.FavoritesPage),
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
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/forgot-password.page').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/reset-password.page').then(m => m.ResetPasswordPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/pages/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.page').then(m => m.AboutPage),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/privacy/privacy.page').then(m => m.PrivacyPage),
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
