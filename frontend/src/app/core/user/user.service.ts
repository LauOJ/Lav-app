import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { AppLanguage, User } from './user.model';

export interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.api.baseUrl}/users/me`);
  }

  register(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.api.baseUrl}/users`, {
      email,
      password,
    });
  }

  updateLanguage(language_preference: AppLanguage): Observable<User> {
    return this.http.patch<User>(`${this.api.baseUrl}/users/me/language`, {
      language_preference,
    });
  }

  updateProfile(data: { name?: string | null; email?: string }): Observable<User> {
    return this.http.patch<User>(`${this.api.baseUrl}/users/me`, data);
  }

  changePassword(current_password: string, new_password: string): Observable<void> {
    return this.http.patch<void>(`${this.api.baseUrl}/users/me/password`, {
      current_password,
      new_password,
    });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.api.baseUrl}/users/me`);
  }
}
