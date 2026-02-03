import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const WCS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/wc-list.page').then(m => m.WCListPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/wc-detail.page').then(m => m.WcDetailPage),
  },
  {
    path: ':id/reviews/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../wcs/pages/review-form.page').then(m => m.ReviewFormPage),
  },
];
