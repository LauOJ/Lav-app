import { CommonModule } from '@angular/common';

import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { WCService } from '../services/wc.service';
import { WC } from '../models/wc.model';
import { WCFilters } from '../models/wc-filters.model';

@Component({
  imports: [CommonModule, RouterModule],
  templateUrl: './wc-list.page.html'
})
export class WCListPage {
  private readonly wcService = inject(WCService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly queryParams = toSignal<Params>(
    this.route.queryParams
  );
  

  readonly wcs = signal<WC[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly currentFilters = signal<WCFilters>({});
  readonly filteredWcs = computed(() =>
    this.wcs().filter((wc) => {
      const filters = this.currentFilters();
      if (filters.clean && (wc.avg_cleanliness == null || wc.avg_cleanliness < 3.5)) return false;
      if (filters.safe && (wc.safety_score == null || wc.safety_score < 0.7)) return false;
      if (filters.accessible && (wc.accessibility_score == null || wc.accessibility_score < 0.6)) return false;
      if (filters.withPaper && (wc.toilet_paper_score == null || wc.toilet_paper_score < 0.6)) return false;
      if (filters.enoughReviews && wc.reviews_count < 3) return false;
      return true;
    })
  );


  constructor() {
    effect(() => {
      const params = this.queryParams(); 
      if (!params) return;

      const filters: WCFilters = {
        clean: params['clean'] === 'true' ? true : undefined,
        safe: params['safe'] === 'true' ? true : undefined,
        accessible: params['accessible'] === 'true' ? true : undefined,
        withPaper: params['withPaper'] === 'true' ? true : undefined,
        enoughReviews: params['enoughReviews'] === 'true' ? true : undefined,
      };

      this.currentFilters.set(filters);
      this.loadWCs();
    });
  }

  private loadWCs() {
    this.loading.set(true);
    this.error.set(null);

    this.wcService.getWCs().subscribe({
      next: (wcs) => {
        this.wcs.set(wcs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los WCs');
        this.loading.set(false);
      },
    });
  }

  isChecked(key: keyof WCFilters): boolean {
    return this.currentFilters()[key] === true;
  }

  onToggle(key: keyof WCFilters, checked: boolean) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [key]: checked ? 'true' : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  cleanlinessStars(value: number | null): string {
    if (value == null) return 'Sin datos';
    const rounded = Math.min(5, Math.max(0, Math.round(value)));
    return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
  }

  asPercentage(score: number | null): string {
    if (score == null) return 'Sin datos';
    return `${Math.round(score * 100)}%`;
  }
}
