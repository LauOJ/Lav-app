import { Injectable, signal, computed } from '@angular/core';

const TOKEN_KEY = 'wcadvisor_token';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly token = this._token.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token());

  setToken(token: string) {
    this._token.set(token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }
}
