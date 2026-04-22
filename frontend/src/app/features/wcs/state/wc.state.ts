import { Injectable, computed, signal } from '@angular/core';

import { WC } from '../models/wc.model';
import { WCFilters } from '../models/wc-filters.model';
import { normalizeWcScore } from '../utils/wc.utils';

type FilterState = WCFilters;

const DEFAULT_FILTERS: FilterState = {
  isPublic: false,
  clean: false,
  safe: false,
  accessible: false,
  withPaper: false,
  freeEntry: false,
  genderMixed: false,
  changingTable: false,
  stepFree: false,
  wideDoor: false,
  turningSpace: false,
  grabBars: false,
  hygieneProducts: false,
  menstrualCup: false,
};

const THRESHOLDS = {
  clean: 3.5,
  safe: 0.7,
  accessible: 0.6,
  withPaper: 0.6,
  freeEntry: 0.5,
  genderMixed: 0.5,
  changingTable: 0.5,
  stepFree: 0.5,
  wideDoor: 0.5,
  turningSpace: 0.5,
  grabBars: 0.5,
  hygieneProducts: 0.5,
  menstrualCup: 0.5,
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
      if (filters.isPublic && !wc.is_public) return false;
      if (filters.clean && (wc.avg_cleanliness == null || wc.avg_cleanliness < THRESHOLDS.clean)) return false;
      if (filters.safe && (normalizeWcScore(wc.safety_score) ?? -1) < THRESHOLDS.safe) return false;
      if (filters.accessible && (normalizeWcScore(wc.accessibility_score) ?? -1) < THRESHOLDS.accessible) return false;
      if (filters.withPaper && (normalizeWcScore(wc.toilet_paper_score) ?? -1) < THRESHOLDS.withPaper) return false;
      if (filters.freeEntry && !filters.isPublic && (normalizeWcScore(wc.free_entry_score) ?? -1) < THRESHOLDS.freeEntry) return false;
      if (filters.genderMixed && (normalizeWcScore(wc.gender_mixed_score) ?? -1) < THRESHOLDS.genderMixed) return false;
      if (filters.changingTable && (normalizeWcScore(wc.changing_table_score) ?? -1) < THRESHOLDS.changingTable) return false;
      if (filters.stepFree && (normalizeWcScore(wc.step_free_score) ?? -1) < THRESHOLDS.stepFree) return false;
      if (filters.wideDoor && (normalizeWcScore(wc.wide_door_score) ?? -1) < THRESHOLDS.wideDoor) return false;
      if (filters.turningSpace && (normalizeWcScore(wc.turning_space_score) ?? -1) < THRESHOLDS.turningSpace) return false;
      if (filters.grabBars && (normalizeWcScore(wc.grab_bars_score) ?? -1) < THRESHOLDS.grabBars) return false;
      if (filters.hygieneProducts && (normalizeWcScore(wc.hygiene_products_score) ?? -1) < THRESHOLDS.hygieneProducts) return false;
      if (filters.menstrualCup && (normalizeWcScore(wc.menstrual_cup_score) ?? -1) < THRESHOLDS.menstrualCup) return false;
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

  mergeWcs(incoming: WC[]): void {
    this.wcs.update((current) => {
      const byId = new Map(current.map(wc => [wc.id, wc]));
      for (const wc of incoming) {
        byId.set(wc.id, wc);
      }
      return Array.from(byId.values());
    });
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
