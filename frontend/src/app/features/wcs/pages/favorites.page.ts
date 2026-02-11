import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WCService } from '../services/wc.service';
import { WC } from '../models/wc.model';

@Component({
  standalone: true,
  imports: [RouterModule],
  templateUrl: './favorites.page.html',
})
export class FavoritesPage {
  private readonly wcService = inject(WCService);

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
        this.error.set('No se pudieron cargar los favoritos.');
        this.loading.set(false);
      },
    });
  }
}
