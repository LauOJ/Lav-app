import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';

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
}
