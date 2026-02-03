import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from './user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class UserState {
  private readonly userService = inject(UserService);

  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  setUser(user: User) {
    this._user.set(user);
  }

  clearUser() {
    this._user.set(null);
  }

  loadMe() {
    this.userService.getMe().subscribe({
      next: user => this._user.set(user),
      error: () => this._user.set(null),
    });
  }
}
