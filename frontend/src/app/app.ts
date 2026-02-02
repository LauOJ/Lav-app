import { Component, inject } from '@angular/core';
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

  onLogout() {
    this.authState.clearToken();
    this.userState.clearUser();
    this.router.navigate(['/login']);
  }
}
