import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { UserService } from '../../../core/user/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthState } from '../../../core/auth/auth.state';
import { UserState } from '../../../core/user/user.state';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, RouterModule, TranslatePipe, LucideIconComponent],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly userState = inject(UserState);
  private readonly translate = inject(TranslateService);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit() {
    if (this.password().length < 8) {
      this.error.set(this.translate.instant('auth.register.error_min_length'));
      return;
    }
    if (!/[A-Za-z]/.test(this.password()) || !/\d/.test(this.password())) {
      this.error.set(this.translate.instant('auth.register.error_complexity'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.registerAndLogin(this.email(), this.password()).subscribe({
      next: (response) => {
        this.authState.setToken(response.access_token);

        this.userService.getMe().subscribe({
          next: (user) => {
            this.userState.setUser(user);
            this.loading.set(false);
            this.router.navigate(['/explore']);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          this.error.set(this.translate.instant('auth.register.error_email_taken'));
        } else {
          this.error.set(this.translate.instant('auth.register.error_generic'));
        }
      },
    });
  }
}
