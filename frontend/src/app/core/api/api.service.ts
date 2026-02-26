import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  baseUrl = environment.apiUrl;
  
  get<T>(url: string, options?: object) {
    return this.http.get<T>(`${this.baseUrl}${url}`, options);
  }

  post<T>(url: string, body: unknown, options?: object) {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, options);
  }

  put<T>(url: string, body: unknown, options?: object) {
    return this.http.put<T>(`${this.baseUrl}${url}`, body, options);
  }

  patch<T>(url: string, body: unknown, options?: object) {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, options);
  }

  delete<T>(url: string, options?: object) {
    return this.http.delete<T>(`${this.baseUrl}${url}`, options);
  }
}
