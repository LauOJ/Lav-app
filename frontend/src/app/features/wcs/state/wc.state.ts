import { Injectable, computed, signal } from '@angular/core';

import { WC } from '../models/wc.model';
import { WCFilters } from '../models/wc-filters.model';
import { normalizeWcScore } from '../utils/wc.utils';

type FilterState = WCFilters;

const DEFAULT_FILTERS: FilterState = {
  clean: false,
  safe: false,
  accessible: false,
  withPaper: false,
  hygieneProducts: false,
  isPublic: false,
  freeEntry: false,
  genderMixed: false,
  changingTable: false,
};

const THRESHOLDS = {
  clean: 3.5,
  safe: 0.7,
  accessible: 0.6,
  withPaper: 0.6,
  hygieneProducts: 0.5,
  freeEntry: 0.5,
  genderMixed: 0.5,
} as const;

@Injectable({
  providedIn: 'root',
})
export class WCState {
  readonly wcs = signal<WC[]>([]);
  readonly filters = signal<FilterState>(DEFAULT_FILTERS);
  readonly selectedWcId = signal<string | null>(null);

  readonly selectedWcIdAsNumber = computed(() => {
    const selected = this.selectedWcId();
    if (selected == null) return null;
    const parsed = Number(selected);
    return Number.isNaN(parsed) ? null : parsed;
  });

  readonly filteredWcs = computed(() => {
    const filters = this.filters();
    return this.wcs().filter((wc) => {
      if (filters.clean && (wc.avg_cleanliness == null || wc.avg_cleanliness < THRESHOLDS.clean)) return false;
      if (filters.safe && (normalizeWcScore(wc.safety_score) ?? -1) < THRESHOLDS.safe) return false;
      if (filters.accessible && (normalizeWcScore(wc.accessibility_score) ?? -1) < THRESHOLDS.accessible) return false;
      if (filters.withPaper && (normalizeWcScore(wc.toilet_paper_score) ?? -1) < THRESHOLDS.withPaper) return false;
      if (filters.hygieneProducts && (normalizeWcScore(wc.hygiene_products_score) ?? -1) < THRESHOLDS.hygieneProducts) return false;
      if (filters.isPublic && !wc.is_public) return false;
      if (filters.freeEntry && !filters.isPublic && (normalizeWcScore(wc.free_entry_score) ?? -1) < THRESHOLDS.freeEntry) return false;
      if (filters.genderMixed && (normalizeWcScore(wc.gender_mixed_score) ?? -1) < THRESHOLDS.genderMixed) return false;
      if (filters.changingTable && !wc.has_changing_table) return false;
      return true;
    });
  });

  readonly selectedWc = computed(() => {
    const selectedId = this.selectedWcIdAsNumber();
    if (selectedId == null) return null;
    return this.wcs().find((wc) => wc.id === selectedId) ?? null;
  });

  setWcs(wcs: WC[]): void {
    this.wcs.set(wcs);
  }

  upsertWc(wc: WC): void {
    this.wcs.update((current) => {
      const index = current.findIndex((item) => item.id === wc.id);
      if (index === -1) return [...current, wc];
      const next = [...current];
      next[index] = wc;
      return next;
    });
  }

  setFilter(key: keyof FilterState, value: boolean): void {
    this.filters.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  setFilters(filters: Partial<FilterState>): void {
    this.filters.update((current) => ({
      ...current,
      ...filters,
    }));
  }

  selectWc(id: number | string | null): void {
    this.selectedWcId.set(id == null ? null : String(id));
  }

  getWcById(id: number): WC | null {
    return this.wcs().find((wc) => wc.id === id) ?? null;
  }
}
