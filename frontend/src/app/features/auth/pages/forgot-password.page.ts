import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly email = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.forgotPassword(this.email()).subscribe({
      next: () => {
        this.submitted.set(true);
        this.loading.set(false);
      },
      error: () => {
        // Still show success — never reveal whether the email exists
        this.submitted.set(true);
        this.loading.set(false);
      },
    });
  }
}
