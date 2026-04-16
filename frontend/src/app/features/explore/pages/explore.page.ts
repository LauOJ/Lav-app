import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WCFilters } from '../../wcs/models/wc-filters.model';
import { wcDistanceMeters } from '../../wcs/utils/wc.utils';
import { WCState } from '../../wcs/state/wc.state';

import { environment } from '../../../../environments/environment';
import { WCService } from '../../wcs/services/wc.service';
import { MapViewComponent } from '../components/map-view/map-view.component';
import { WcDetailSheet } from '../components/wc-detail-sheet/wc-detail-sheet.component';
import { LucideIconComponent, LucideIconName } from '../../../shared/components/lucide-icon/lucide-icon.component';

// Labels are translation keys — resolved in the template via | translate
interface FilterChip {
  key: keyof WCFilters;
  label: string;  // i18n key
  icon: LucideIconName;
}

@Component({
  imports: [
    CommonModule,
    RouterModule,
    MapViewComponent,
    WcDetailSheet,
    LucideIconComponent,
    TranslatePipe,
  ],
  templateUrl: './explore.page.html',
  styleUrl: './explore.page.css'
})
export class ExplorePage implements OnInit {
  private readonly wcService = inject(WCService);
  readonly wcState = inject(WCState);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly nearbyRadiusMeters = 30;

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly userLocation = signal<{ lat: number; lng: number; zoom: number } | null>(null);
  readonly geoError = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly searchError = signal<string | null>(null);
  readonly searchLoading = signal(false);

  readonly filterChips: ReadonlyArray<FilterChip> = [
    { key: 'isPublic', label: 'filter.isPublic', icon: 'door-open' },
    { key: 'clean',    label: 'filter.clean',    icon: 'sparkles' },
    { key: 'accessible', label: 'filter.accessible', icon: 'accessibility' },
  ];

  readonly moreFilterChips: ReadonlyArray<FilterChip> = [
    { key: 'safe',           label: 'filter.safe',           icon: 'lock' },
    { key: 'withPaper',      label: 'filter.withPaper',      icon: 'scroll' },
    { key: 'hygieneProducts',label: 'filter.hygieneProducts', icon: 'droplets' },
    { key: 'freeEntry',      label: 'filter.freeEntry',      icon: 'tag' },
    { key: 'genderMixed',    label: 'filter.genderMixed',    icon: 'non-binary' },
    { key: 'changingTable',  label: 'filter.changingTable',  icon: 'baby' },
  ];

  readonly showMoreFilters = signal(false);
  readonly activeTooltip = signal<string | null>(null);
  private longPressTimer: number | null = null;

  onFilterPointerDown(event: PointerEvent, key: string): void {
    if (event.pointerType === 'mouse') return;
    this.longPressTimer = window.setTimeout(() => {
      this.activeTooltip.set(key);
    }, 450);
  }

  onFilterPointerUp(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.activeTooltip.set(null);
  }

  readonly activeMoreFiltersCount = computed(() =>
    this.moreFilterChips.filter(c => this.wcState.filters()[c.key]).length
  );

  readonly showEmptyState = computed(
    () => !this.loading() && !this.error() && this.wcState.filteredWcs().length === 0
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
    this.wcState.selectWc(id);
  }

  onCloseSheet(): void {
    this.wcState.selectWc(null);
  }

  readonly nearbyConfirm = signal<{ lat: number; lng: number } | null>(null);
  readonly nearbyWcs = signal<{ id: number; name: string }[]>([]);
  readonly showNearbyList = signal(false);

  onAddWcAt(coords: { lat: number; lng: number }): void {
    const nearby = this.getNearbyWcs(coords.lat, coords.lng);
    if (nearby.length > 0) {
      this.nearbyWcs.set(nearby.map(wc => ({ id: wc.id, name: wc.name })));
      this.showNearbyList.set(false);
      this.nearbyConfirm.set(coords);
      return;
    }
    this.navigateToNewWc(coords);
  }

  onNearbyConfirm(): void {
    const coords = this.nearbyConfirm();
    this.nearbyConfirm.set(null);
    if (coords) this.navigateToNewWc(coords);
  }

  onNearbyCancel(): void {
    this.nearbyConfirm.set(null);
  }

  private navigateToNewWc(coords: { lat: number; lng: number }): void {
    this.router.navigate(['/wcs', 'new'], {
      queryParams: { lat: coords.lat, lng: coords.lng },
    });
  }

  onToggleFilter(key: keyof WCFilters, value: boolean): void {
    this.wcState.setFilter(key, value);
  }

  onClearFilters(): void {
    const current = this.wcState.filters();
    const reset: Partial<WCFilters> = {};
    for (const key of Object.keys(current) as Array<keyof WCFilters>) {
      reset[key] = false;
    }
    this.wcState.setFilters(reset);
    this.showMoreFilters.set(false);
  }

  onLocateUser(): void {
    this.geoError.set(null);
    if (!navigator.geolocation) {
      this.geoError.set(this.translate.instant('explore.geo_unavailable'));
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
        this.geoError.set(this.translate.instant('explore.geo_error'));
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
          this.searchError.set(this.translate.instant('explore.search_error'));
          return;
        }
        const result = results[0];
        const lat = result.lat;
        const lng = result.lon;
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          this.searchError.set(this.translate.instant('explore.search_error'));
          return;
        }
        this.userLocation.set({ lat, lng, zoom: 14 });
      })
      .catch(() => {
        this.searchError.set(this.translate.instant('explore.search_fetch_error'));
      })
      .finally(() => {
        this.searchLoading.set(false);
      });
  }

  private loadWcs(): void {
    if (this.wcState.wcs().length > 0) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.wcService.getWCs().subscribe({
      next: (wcs) => {
        this.wcState.setWcs(wcs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('explore.load_error'));
        this.loading.set(false);
      },
    });
  }

  private getNearbyWcs(lat: number, lng: number) {
    return this.wcState.wcs().filter(wc => {
      if (wc.latitude == null || wc.longitude == null) return false;
      return wcDistanceMeters(lat, lng, wc.latitude, wc.longitude) <= this.nearbyRadiusMeters;
    });
  }
}
