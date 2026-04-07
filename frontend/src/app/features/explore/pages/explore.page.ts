import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { WCFilters } from '../../wcs/models/wc-filters.model';
import { wcDistanceMeters } from '../../wcs/utils/wc.utils';
import { WCState } from '../../wcs/state/wc.state';

import { environment } from '../../../../environments/environment';
import { WCService } from '../../wcs/services/wc.service';
import { MapViewComponent } from '../components/map-view/map-view.component';
import { WcDetailSheet } from '../components/wc-detail-sheet/wc-detail-sheet.component';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    MapViewComponent,
    WcDetailSheet,
  ],
  templateUrl: './explore.page.html',
  styleUrl: './explore.page.css'
})
export class ExplorePage implements OnInit {
  private readonly wcService = inject(WCService);
  readonly wcState = inject(WCState);
  private readonly router = inject(Router);
  private readonly nearbyRadiusMeters = 30;

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly userLocation = signal<{ lat: number; lng: number; zoom: number } | null>(null);
  readonly geoError = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly searchError = signal<string | null>(null);
  readonly searchLoading = signal(false);
  readonly filterChips: ReadonlyArray<{ key: keyof WCFilters; label: string; icon: string }> = [
    { key: 'isPublic', label: 'Público', icon: '🚪' },
    { key: 'clean', label: 'Limpio', icon: '⭐' },
    { key: 'accessible', label: 'Accesible', icon: '♿' },
  ];

  readonly moreFilterChips: ReadonlyArray<{ key: keyof WCFilters; label: string; icon: string }> = [
    { key: 'safe', label: 'Seguro', icon: '🟢' },
    { key: 'withPaper', label: 'Papel', icon: '🧻' },
    { key: 'hygieneProducts', label: 'Higiene', icon: '🧴' },
    { key: 'freeEntry', label: 'Sin consumición', icon: '🆓' },
    { key: 'genderMixed', label: 'Mixto', icon: '🚻' },
    { key: 'changingTable', label: 'Cambiador', icon: '👶' },
  ];

  readonly showMoreFilters = signal(false);

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
        this.error.set('No se pudieron cargar los WCs');
        this.loading.set(false);
      },
    });
  }

  private hasNearbyWcs(lat: number, lng: number): boolean {
    for (const wc of this.wcState.wcs()) {
      if (wc.latitude == null || wc.longitude == null) continue;
      if (wcDistanceMeters(lat, lng, wc.latitude, wc.longitude) <= this.nearbyRadiusMeters) {
        return true;
      }
    }
    return false;
  }
}
