import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.api.baseUrl}/users/me`);
  }
}
