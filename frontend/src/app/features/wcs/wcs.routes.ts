import { Routes } from '@angular/router';

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
];
