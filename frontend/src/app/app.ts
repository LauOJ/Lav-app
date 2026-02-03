import { Component, inject, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { UserState } from './core/user/user.state';
import { AuthState } from './core/auth/auth.state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly userState = inject(UserState);
  readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authState.isAuthenticated() && !this.userState.user()) {
        this.userState.loadMe();
      }
    });
  }

  onLogout() {
    this.authState.clearToken();
    this.userState.clearUser();
    this.router.navigate(['/login']);
  }
}
