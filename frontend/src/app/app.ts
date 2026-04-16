import { Component, inject, effect, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LucideIconComponent } from './shared/components/lucide-icon/lucide-icon.component';
import { AuthState } from './core/auth/auth.state';
import { UserState } from './core/user/user.state';
import { LanguageService } from './core/i18n/language.service';
import { AppLanguage } from './core/user/user.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LucideIconComponent, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly userState = inject(UserState);
  readonly authState = inject(AuthState);
  readonly langService = inject(LanguageService);
  private readonly router = inject(Router);

  readonly isUserMenuOpen = signal(false);

  constructor() {
    // Init language once on startup (reads DB pref / localStorage / navigator)
    this.langService.init();

    effect(() => {
      // Once user loads after login, re-apply their DB language preference
      const user = this.userState.user();
      if (user) {
        this.langService.init();
      }
    });

    effect(() => {
      if (this.authState.isAuthenticated() && !this.userState.user()) {
        this.userState.loadMe();
      }
    });
  }

  get currentLang(): AppLanguage {
    return this.langService.currentLang;
  }

  switchLang(lang: AppLanguage): void {
    this.langService.setLang(lang);
    this.closeUserMenu();
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
