import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { WC } from '../../wcs/models/wc.model';

type ExploreFilters = {
  accessible: boolean;
  gender_neutral: boolean;
  has_changing_table: boolean;
  only_for_customers: boolean;
  has_intimate_hygiene_products: boolean;
  minCleanliness: number | null;
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
  private readonly router = inject(Router);
  private readonly nearbyRadiusMeters = 30;

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
    minCleanliness: null,
  });
  readonly showAdvancedFilters = signal(false);

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
      if (filters.minCleanliness !== null) {
        if (wc.avg_cleanliness == null) return false;
        if (wc.avg_cleanliness < filters.minCleanliness) return false;
      }
      return true;
    });
  });
  readonly showEmptyState = computed(
    () => !this.loading() && !this.error() && this.filteredWcs().length === 0
  );

  ngOnInit(): void {
    this.loadWcs();
  }

  onSelectWc(id: number): void {
    this.selectedWcId.set(id);
  }

  onCloseSheet(): void {
    this.selectedWcId.set(null);
  }

  onAddWcAt(coords: { lat: number; lng: number }): void {
    if (this.hasNearbyWcs(coords.lat, coords.lng)) {
      const shouldContinue = confirm(
        'Ya hay WCs cerca de esta ubicación. ¿Quieres añadir uno igualmente?'
      );
      if (!shouldContinue) return;
    }
    this.router.navigate(['/wcs', 'new'], {
      queryParams: { lat: coords.lat, lng: coords.lng },
    });
  }

  onToggleFilter(key: keyof ExploreFilters, value: boolean) {
    this.filters.update(current => ({
      ...current,
      [key]: value,
    }));
  }

  onSetMinCleanliness(value: number | null) {
    this.filters.update(current => ({
      ...current,
      minCleanliness: value,
    }));
  }

  onToggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
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

  private hasNearbyWcs(lat: number, lng: number): boolean {
    for (const wc of this.wcs()) {
      if (wc.latitude == null || wc.longitude == null) continue;
      if (
        this.distanceMeters(lat, lng, wc.latitude, wc.longitude) <=
        this.nearbyRadiusMeters
      ) {
        return true;
      }
    }
    return false;
  }

  private distanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const radius = 6371000;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
