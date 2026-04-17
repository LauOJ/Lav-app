import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { UserService } from '../../../core/user/user.service';
import { UserState } from '../../../core/user/user.state';
import { AuthState } from '../../../core/auth/auth.state';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-profile-page',
  imports: [RouterModule, TranslatePipe, LucideIconComponent],
  templateUrl: './profile.page.html',
  styles: [
    '.fieldset-reset { border: none; margin: 0 0 1.25rem 0; padding: 0; }',
  ],
})
export class ProfilePage {
  private readonly userService = inject(UserService);
  private readonly userState = inject(UserState);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly user = this.userState.user;

  // Profile form
  readonly profileName = signal('');
  readonly profileEmail = signal('');
  readonly profileLoading = signal(false);
  readonly profileError = signal<string | null>(null);
  readonly profileSuccess = signal(false);

  // Password form
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly pwdLoading = signal(false);
  readonly pwdError = signal<string | null>(null);
  readonly pwdSuccess = signal(false);

  // Delete
  readonly showDeleteConfirm = signal(false);
  readonly deleteLoading = signal(false);
  readonly deleteError = signal<string | null>(null);

  constructor() {
    const u = this.userState.user();
    if (u) {
      this.profileName.set(u.name ?? '');
      this.profileEmail.set(u.email);
    }
  }

  submitProfile() {
    const name = this.profileName().trim() || null;
    const email = this.profileEmail().trim();

    if (!email) {
      this.profileError.set(this.translate.instant('profile.error_email_required'));
      return;
    }

    this.profileLoading.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(false);

    this.userService.updateProfile({ name, email }).subscribe({
      next: (updated) => {
        this.userState.setUser(updated);
        this.profileSuccess.set(true);
        this.profileLoading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 409) {
          this.profileError.set(this.translate.instant('profile.error_email_taken'));
        } else {
          this.profileError.set(this.translate.instant('profile.error_profile'));
        }
        this.profileLoading.set(false);
      },
    });
  }

  submitPassword() {
    const current = this.currentPassword();
    const next = this.newPassword();

    if (!current || !next) {
      this.pwdError.set(this.translate.instant('profile.error_pwd_required'));
      return;
    }
    if (next.length < 8) {
      this.pwdError.set(this.translate.instant('profile.error_pwd_min_length'));
      return;
    }

    this.pwdLoading.set(true);
    this.pwdError.set(null);
    this.pwdSuccess.set(false);

    this.userService.changePassword(current, next).subscribe({
      next: () => {
        this.pwdSuccess.set(true);
        this.currentPassword.set('');
        this.newPassword.set('');
        this.pwdLoading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 400) {
          this.pwdError.set(this.translate.instant('profile.error_pwd_wrong'));
        } else {
          this.pwdError.set(this.translate.instant('profile.error_pwd_generic'));
        }
        this.pwdLoading.set(false);
      },
    });
  }

  confirmDelete() {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deleteError.set(null);
  }

  deleteAccount() {
    this.deleteLoading.set(true);
    this.deleteError.set(null);

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.authState.clearToken();
        this.userState.clearUser();
        this.router.navigate(['/explore']);
      },
      error: () => {
        this.deleteError.set(this.translate.instant('profile.error_delete'));
        this.deleteLoading.set(false);
      },
    });
  }
}
