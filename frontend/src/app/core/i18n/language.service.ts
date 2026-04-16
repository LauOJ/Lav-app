import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLanguage } from '../user/user.model';
import { UserService } from '../user/user.service';
import { UserState } from '../user/user.state';

const LS_KEY = 'wc_advisor_lang';
const SUPPORTED: AppLanguage[] = ['ca', 'es'];
const DEFAULT_LANG: AppLanguage = 'ca';

function isSupportedLang(value: string | null): value is AppLanguage {
  return SUPPORTED.includes(value as AppLanguage);
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly userState = inject(UserState);
  private readonly userService = inject(UserService);

  /**
   * Called once at app startup (in app.ts constructor/ngOnInit).
   * Priority: DB user preference → localStorage → navigator.language → 'ca'
   */
  init(): void {
    this.translate.addLangs(SUPPORTED);
    this.translate.setDefaultLang(DEFAULT_LANG);

    const lang = this.resolveInitialLang();
    this.applyLang(lang, false);
  }

  get currentLang(): AppLanguage {
    return (this.translate.currentLang ?? DEFAULT_LANG) as AppLanguage;
  }

  /**
   * Switch language. Persists to localStorage always, and to DB if logged in.
   */
  setLang(lang: AppLanguage): void {
    this.applyLang(lang, true);
  }

  private resolveInitialLang(): AppLanguage {
    // 1) DB preference (already loaded into UserState if user is logged in)
    const user = this.userState.user();
    if (user && isSupportedLang(user.language_preference)) {
      return user.language_preference;
    }

    // 2) localStorage
    const stored = localStorage.getItem(LS_KEY);
    if (isSupportedLang(stored)) {
      return stored;
    }

    // 3) navigator.language (e.g. "ca", "ca-ES", "es-ES", "es")
    const nav = navigator.language?.split('-')[0];
    if (isSupportedLang(nav)) {
      return nav;
    }

    // 4) fallback
    return DEFAULT_LANG;
  }

  private applyLang(lang: AppLanguage, persist: boolean): void {
    this.translate.use(lang);
    document.documentElement.lang = lang;

    localStorage.setItem(LS_KEY, lang);

    if (persist && this.userState.isLoggedIn()) {
      this.userService.updateLanguage(lang).subscribe({
        next: (updatedUser) => this.userState.setUser(updatedUser),
      });
    }
  }
}
