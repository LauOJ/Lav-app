import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthState } from '../../../core/auth/auth.state';
import { UserService } from '../../../core/user/user.service';
import { UserState } from '../../../core/user/user.state';


@Component({
  selector: 'app-login-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly userService = inject(UserService);
  private readonly userState = inject(UserState);
  
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.loginAndLoadUser(this.email(), this.password()).subscribe({
      next: (user) => {
        this.userState.setUser(user);
        this.loading.set(false);
        this.router.navigate(['/wcs']);
      },
      error: () => {
        this.error.set('Email o contraseña incorrectos');
        this.loading.set(false);
      },
    });
  }
}
