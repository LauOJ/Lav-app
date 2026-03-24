import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { WC } from '../../wcs/models/wc.model';

type ExploreFilters = {
  clean: boolean;
  safe: boolean;
  accessible: boolean;
  withPaper: boolean;
  enoughReviews: boolean;
};
import { environment } from '../../../../environments/environment';
import { WCService } from '../../wcs/services/wc.service';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';
import { MapViewComponent } from '../components/map-view/map-view.component';
import { WcDetailSheet } from '../components/wc-detail-sheet/wc-detail-sheet.component';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    LucideIconComponent,
    MapViewComponent,
    WcDetailSheet,
  ],
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
  readonly userLocation = signal<{ lat: number; lng: number; zoom: number } | null>(null);
  readonly geoError = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly searchError = signal<string | null>(null);
  readonly searchLoading = signal(false);
  readonly filters = signal<ExploreFilters>({
    clean: false,
    safe: false,
    accessible: false,
    withPaper: false,
    enoughReviews: false,
  });
  /** Which filter button's tooltip is shown (we hide it after 500ms instead of relying on blur) */
  readonly activeTooltipFilter = signal<keyof ExploreFilters | null>(null);

  readonly selectedWc = computed(() => {
    const selectedId = this.selectedWcId();
    return this.wcs().find(wc => wc.id === selectedId) ?? null;
  });
  readonly filteredWcs = computed(() => {
    const filters = this.filters();
    return this.wcs().filter(wc => {
      if (filters.clean && (wc.avg_cleanliness == null || wc.avg_cleanliness < 3.5)) return false;
      if (filters.safe && (wc.safety_score == null || wc.safety_score < 0.7)) return false;
      if (filters.accessible && (wc.accessibility_score == null || wc.accessibility_score < 0.6)) return false;
      if (filters.withPaper && (wc.toilet_paper_score == null || wc.toilet_paper_score < 0.6)) return false;
      if (filters.enoughReviews && wc.reviews_count < 3) return false;
      return true;
    });
  });
  readonly showEmptyState = computed(
    () => !this.loading() && !this.error() && this.filteredWcs().length === 0
  );

  ngOnInit(): void {
    this.loadWcs();
    this.requestInitialLocation();
  }

  private requestInitialLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation.set({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 13,
        });
        this.geoError.set(null);
      },
      () => {
        // No permission or error: map stays on default (Barcelona)
      }
    );
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

  setFilterTooltip(key: keyof ExploreFilters | null): void {
    this.activeTooltipFilter.set(key);
  }

  /** Show tooltip on tap/click and hide it after 500ms (does not rely on blur) */
  showFilterTooltipTemporarily(key: keyof ExploreFilters): void {
    this.activeTooltipFilter.set(key);
    setTimeout(() => this.activeTooltipFilter.set(null), 500);
  }

  onLocateUser(): void {
    this.geoError.set(null);
    if (!navigator.geolocation) {
      this.geoError.set('La geolocalización no está disponible en este navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation.set({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 13,
        });
        this.geoError.set(null);
      },
      () => {
        this.geoError.set('No se pudo obtener tu ubicación.');
      }
    );
  }

  onSearchLocation(): void {
    const query = this.searchQuery().trim();
    if (!query) return;

    this.searchLoading.set(true);
    this.searchError.set(null);

    fetch(
      `${environment.apiUrl}/geocode?q=${encodeURIComponent(query)}&limit=1`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('request_failed');
        }
        return response.json() as Promise<Array<{ lat: number; lon: number }>>;
      })
      .then((results) => {
        if (!results.length) {
          this.searchError.set('No se encontraron resultados');
          return;
        }
        const result = results[0];
        const lat = result.lat;
        const lng = result.lon;
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          this.searchError.set('No se encontraron resultados');
          return;
        }
        this.userLocation.set({ lat, lng, zoom: 14 });
      })
      .catch(() => {
        this.searchError.set('No se pudo buscar la ubicación');
      })
      .finally(() => {
        this.searchLoading.set(false);
      });
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
