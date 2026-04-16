import { Component, inject, effect, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
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
  readonly isGuestMenuOpen = signal(false);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  constructor() {
    this.langService.init();

    effect(() => {
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
    this.closeAllMenus();
  }

  toggleUserMenu(): void {
    this.isGuestMenuOpen.set(false);
    this.isUserMenuOpen.update(open => !open);
  }

  toggleGuestMenu(): void {
    this.isUserMenuOpen.set(false);
    this.isGuestMenuOpen.update(open => !open);
  }

  closeAllMenus(): void {
    this.isUserMenuOpen.set(false);
    this.isGuestMenuOpen.set(false);
  }

  // kept for template overlay click
  closeUserMenu(): void {
    this.closeAllMenus();
  }

  onLogout(): void {
    this.closeAllMenus();
    this.authState.clearToken();
    this.userState.clearUser();
    this.router.navigate(['/login']);
  }
}
