import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { AuthTokens } from '../models/user.model';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly api: ApiService,
    private readonly tokenService: TokenService
  ) {}

  login(email: string, password: string): Observable<void> {
    const payload: LoginPayload = { email, password };
    return this.api.post<AuthTokens>('auth/login', payload).pipe(
      tap((tokens) => this.tokenService.setToken(tokens.access_token)),
      map(() => undefined)
    );
  }

  logout(): void {
    this.tokenService.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }
}
