import { Routes } from '@angular/router';

export const WCS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/wc-list.page').then(m => m.WCListPage),
  },
];
