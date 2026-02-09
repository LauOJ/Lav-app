import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

import { WC } from '../../../wcs/models/wc.model';
import { WcFeatureIconsComponent } from '../wc-feature-icons/wc-feature-icons.component';

@Component({
  selector: 'app-wc-detail-sheet',
  imports: [CommonModule, WcFeatureIconsComponent],
  templateUrl: './wc-detail-sheet.component.html',
  styleUrl: './wc-detail-sheet.component.css'
})
export class WcDetailSheet {
  wc = input.required<WC>();
  close = output<void>();
  readonly sheetState = signal<'collapsed' | 'expanded'>('collapsed');
  readonly isExpanded = computed(() => this.sheetState() === 'expanded');
  readonly cleanlinessRating = computed(() =>
    this.toRating(this.wc().avg_cleanliness)
  );
  readonly safetyRating = computed(() => this.toRating(this.wc().avg_safety));
  readonly cleanlinessStars = computed(() =>
    this.toStars(this.cleanlinessRating())
  );
  readonly safetyStars = computed(() => this.toStars(this.safetyRating()));
  readonly cleanlinessAria = computed(
    () => `Limpieza: ${this.cleanlinessRating()} de 5`
  );
  readonly safetyAria = computed(
    () => `Privacidad: ${this.safetyRating()} de 5`
  );

  constructor() {
    effect(() => {
      this.wc();
      this.sheetState.set('collapsed');
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onExpand(): void {
    this.sheetState.set(this.isExpanded() ? 'collapsed' : 'expanded');
  }

  onSheetClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) return;
    this.sheetState.set(this.isExpanded() ? 'collapsed' : 'expanded');
  }

  private toRating(value: number | null): number {
    if (value == null) return 0;
    const rounded = Math.round(value);
    return Math.min(5, Math.max(0, rounded));
  }

  private toStars(rating: number): string {
    return '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating);
  }
}
