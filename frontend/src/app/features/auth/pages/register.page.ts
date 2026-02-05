import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { UserService } from '../../../core/user/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthState } from '../../../core/auth/auth.state';
import { UserState } from '../../../core/user/user.state';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly userState = inject(UserState);
  
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.userService.register(this.email(), this.password()).subscribe({
      next: () => {
        // After registration, automatically log in
        this.authService.login(this.email(), this.password()).subscribe({
          next: (response) => {
            this.authState.setToken(response.access_token);
            
            this.userService.getMe().subscribe({
              next: (user) => {
                this.userState.setUser(user);
                this.loading.set(false);
                this.router.navigate(['/wcs']);
              },
              error: () => {
                this.loading.set(false);
              },
            });
          },
          error: () => {
            this.error.set('Error al iniciar sesión después del registro');
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          this.error.set('Este email ya está registrado');
        } else {
          this.error.set('Error al registrar usuario');
        }
      },
    });
  }
}
