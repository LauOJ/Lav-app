import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthState } from './auth.state';
import { UserState } from '../user/user.state';

const TOKEN_KEY = 'wcadvisor_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  const authState = inject(AuthState);
  const userState = inject(UserState);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/auth/')
      ) {
        authState.clearToken();
        userState.clearUser();
        authState.markSessionExpired();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
