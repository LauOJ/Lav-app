import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const WCS_ROUTES: Routes = [
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/wc-form.page').then(m => m.WCFormPage),
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/wc-form.page').then(m => m.WCFormPage),
  },
  {
    path: ':id/reviews/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../wcs/pages/review-form.page').then(m => m.ReviewFormPage),
  },
  {
    path: ':id/reviews/edit',
    canActivate: [authGuard],
    data: { editMode: true },
    loadComponent: () =>
      import('../wcs/pages/review-form.page').then(m => m.ReviewFormPage),
  },
];
