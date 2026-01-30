import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  imports: [CommonModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.email(), this.password()).subscribe({
      next: (response) => {
        console.log('LOGIN OK → token:', response.access_token);
        this.loading.set(false);

        // ⚠️ Aún NO guardamos el token
        // ⚠️ Aún NO redirigimos
      },
      error: () => {
        this.error.set('Email o contraseña incorrectos');
        this.loading.set(false);
      },
    });
  }
}
