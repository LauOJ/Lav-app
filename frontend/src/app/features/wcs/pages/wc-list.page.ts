import { CommonModule } from '@angular/common';

import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { WCService } from '../services/wc.service';
import { WC } from '../models/wc.model';
import { WCFilters } from '../models/wc-filters.model';

@Component({
  imports: [CommonModule],
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


  constructor() {
    effect(() => {
      const params = this.queryParams(); 
      if (!params) return;

      const filters: WCFilters = {
        accessible: params['accessible'] === 'true' ? true : undefined,
        gender_neutral: params['gender_neutral'] === 'true' ? true : undefined,
        only_for_customers:
          params['only_for_customers'] === 'true' ? true : undefined,
      };

      this.currentFilters.set(filters);
      this.loadWCs(filters);
    });
  }

  private loadWCs(filters: WCFilters) {
    this.loading.set(true);
    this.error.set(null);

    this.wcService.getWCs(filters).subscribe({
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
}
