import { Component, inject, effect, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';

import { LucideIconComponent } from './shared/components/lucide-icon/lucide-icon.component';
import { AuthState } from './core/auth/auth.state';
import { UserState } from './core/user/user.state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LucideIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly userState = inject(UserState);
  readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  readonly isUserMenuOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.authState.isAuthenticated() && !this.userState.user()) {
        this.userState.loadMe();
      }
    });
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(open => !open);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  onLogout(): void {
    this.closeUserMenu();
    this.authState.clearToken();
    this.userState.clearUser();
    this.router.navigate(['/login']);
  }
}
