import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WCService } from '../services/wc.service';
import { WC } from '../models/wc.model';

@Component({
  standalone: true,
  imports: [RouterModule, TranslatePipe],
  templateUrl: './favorites.page.html',
})
export class FavoritesPage {
  private readonly wcService = inject(WCService);
  private readonly translate = inject(TranslateService);

  readonly wcs = signal<WC[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.loading.set(true);
    this.error.set(null);

    this.wcService.getMyFavorites().subscribe({
      next: list => {
        this.wcs.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('favorites.load_error'));
        this.loading.set(false);
      },
    });
  }
}
