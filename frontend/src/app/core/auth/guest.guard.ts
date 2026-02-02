import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';

export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    router.navigate(['/wcs']);
    return false;
  }

  return true;
};
