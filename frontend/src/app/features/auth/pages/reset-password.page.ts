import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../core/auth/auth.service';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-reset-password-page',
  imports: [RouterModule, TranslatePipe, LucideIconComponent],
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);

  token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error.set(this.translate.instant('auth.reset_password.error_invalid_token'));
    }
  }

  onSubmit(): void {
    if (this.password().length < 8) {
      this.error.set(this.translate.instant('auth.reset_password.error_min_length'));
      return;
    }
    if (!/[A-Za-z]/.test(this.password()) || !/\d/.test(this.password())) {
      this.error.set(this.translate.instant('auth.reset_password.error_complexity'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.resetPassword(this.token, this.password()).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 400) {
          this.error.set(this.translate.instant('auth.reset_password.error_invalid_token'));
        } else {
          this.error.set(this.translate.instant('auth.reset_password.error_generic'));
        }
        this.loading.set(false);
      },
    });
  }
}
