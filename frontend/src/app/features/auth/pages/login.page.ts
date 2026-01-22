import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  template: `
    <section class="login">
      <h1>Login</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          Email
          <input type="email" formControlName="email" />
        </label>
        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        <button type="submit" [disabled]="form.invalid">Sign in</button>
      </form>
    </section>
  `,
  styles: [
    `
      .login {
        max-width: 360px;
        display: grid;
        gap: 1rem;
      }

      form {
        display: grid;
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.25rem;
        font-size: 0.9rem;
      }

      input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
      }

      button {
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        border: none;
        background: #111827;
        color: #ffffff;
        cursor: pointer;
      }
    `
  ]
})
export class LoginPageComponent {
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/wcs']),
      error: () => this.form.reset()
    });
  }
}
