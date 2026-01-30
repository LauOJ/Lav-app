import { Injectable, signal, computed } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserState {
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  readonly isLoggedIn = computed(() => !!this._user());

  setUser(user: User) {
    this._user.set(user);
  }

  clearUser() {
    this._user.set(null);
  }
}
