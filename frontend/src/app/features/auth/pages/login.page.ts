import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthState } from '../../../core/auth/auth.state';
import { UserService } from '../../../core/user/user.service';
import { UserState } from '../../../core/user/user.state';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';


@Component({
  selector: 'app-login-page',
  imports: [CommonModule, RouterModule, TranslatePipe, LucideIconComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly userService = inject(UserService);
  private readonly userState = inject(UserState);
  private readonly translate = inject(TranslateService);

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
        this.router.navigate(['/explore']);
      },
      error: () => {
        this.error.set(this.translate.instant('auth.login.error_credentials'));
        this.loading.set(false);
      },
    });
  }
}
