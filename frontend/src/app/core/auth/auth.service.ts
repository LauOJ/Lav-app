import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { ApiService } from '../api/api.service';
import { UserService } from '../user/user.service';
import { AuthState } from './auth.state';
import { User } from '../user/user.model';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly userService = inject(UserService);
  private readonly authState = inject(AuthState);

  login(email: string, password: string): Observable<LoginResponse> {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);

    return this.http.post<LoginResponse>(
      `${this.api.baseUrl}/auth/login`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  }

  loginAndLoadUser(email: string, password: string): Observable<User> {
    return this.login(email, password).pipe(
      tap(response => {
        this.authState.setToken(response.access_token);
      }),
      switchMap(() => this.userService.getMe())
    );
  }

  registerAndLogin(email: string, password: string): Observable<LoginResponse> {
    return this.userService.register(email, password).pipe(
      switchMap(() => this.login(email, password))
    );
  }
}
