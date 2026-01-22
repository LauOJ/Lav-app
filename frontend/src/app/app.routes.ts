import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'wcs' },
  
    {
      path: 'login',
      loadChildren: () =>
        import('./features/auth/auth.module').then(m => m.AuthModule)
    },
  
    {
      path: 'wcs',
      loadChildren: () =>
        import('./features/wcs/wcs.module').then(m => m.WcsModule)
    },
  
    {
      path: 'reviews',
      canActivate: [AuthGuard],
      loadChildren: () =>
        import('./features/reviews/reviews.module').then(m => m.ReviewsModule)
    },
  
    { path: '**', redirectTo: 'wcs' }
  ];
  
