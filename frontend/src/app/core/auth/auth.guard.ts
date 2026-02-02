import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
