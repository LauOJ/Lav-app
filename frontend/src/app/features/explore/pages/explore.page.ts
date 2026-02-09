import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WC } from '../../wcs/models/wc.model';

type ExploreFilters = {
  accessible: boolean;
  gender_neutral: boolean;
  has_changing_table: boolean;
  only_for_customers: boolean;
  has_intimate_hygiene_products: boolean;
};
import { WCService } from '../../wcs/services/wc.service';
import { MapViewComponent } from '../components/map-view/map-view.component';
import { WcDetailSheet } from '../components/wc-detail-sheet/wc-detail-sheet.component';

@Component({
  imports: [CommonModule, RouterModule, MapViewComponent, WcDetailSheet],
  templateUrl: './explore.page.html',
  styleUrl: './explore.page.css'
})
export class ExplorePage implements OnInit {
  private readonly wcService = inject(WCService);

  readonly selectedWcId = signal<number | null>(null);
  readonly wcs = signal<WC[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly filters = signal<ExploreFilters>({
    accessible: false,
    gender_neutral: false,
    has_changing_table: false,
    only_for_customers: false,
    has_intimate_hygiene_products: false,
  });

  readonly selectedWc = computed(() => {
    const selectedId = this.selectedWcId();
    return this.wcs().find(wc => wc.id === selectedId) ?? null;
  });
  readonly filteredWcs = computed(() => {
    const filters = this.filters();
    return this.wcs().filter(wc => {
      if (filters.accessible && !wc.accessible) return false;
      if (filters.gender_neutral && !wc.gender_neutral) return false;
      if (filters.has_changing_table && !wc.has_changing_table) return false;
      if (filters.only_for_customers && !wc.only_for_customers) return false;
      if (
        filters.has_intimate_hygiene_products &&
        !wc.has_intimate_hygiene_products
      ) {
        return false;
      }
      return true;
    });
  });

  ngOnInit(): void {
    this.loadWcs();
  }

  onSelectWc(id: number): void {
    this.selectedWcId.set(id);
  }

  onCloseSheet(): void {
    this.selectedWcId.set(null);
  }

  onToggleFilter(key: keyof ExploreFilters, value: boolean) {
    this.filters.update(current => ({
      ...current,
      [key]: value,
    }));
  }

  private loadWcs(): void {
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
}
