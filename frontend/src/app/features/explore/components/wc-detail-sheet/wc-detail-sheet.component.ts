import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';

import { WC } from '../../../wcs/models/wc.model';
import { WcFeatureIconsComponent } from '../wc-feature-icons/wc-feature-icons.component';
import { ReviewsService } from '../../../reviews/services/reviews.service';
import { Review } from '../../../reviews/models/review.model';

@Component({
  selector: 'app-wc-detail-sheet',
  imports: [CommonModule, WcFeatureIconsComponent],
  templateUrl: './wc-detail-sheet.component.html',
  styleUrl: './wc-detail-sheet.component.css'
})
export class WcDetailSheet {
  private readonly reviewsService = inject(ReviewsService);

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
  readonly showReviews = signal(false);
  readonly reviews = signal<Review[]>([]);
  readonly reviewsLoading = signal(false);
  readonly reviewsError = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.wc();
      this.sheetState.set('collapsed');
      this.showReviews.set(false);
    });

    effect(() => {
      const shouldLoad = this.showReviews();
      const wcId = this.wc().id;
      if (!shouldLoad) return;
      this.loadReviews(wcId);
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

  onToggleReviews(): void {
    this.showReviews.set(!this.showReviews());
  }

  private toRating(value: number | null): number {
    if (value == null) return 0;
    const rounded = Math.round(value);
    return Math.min(5, Math.max(0, rounded));
  }

  private toStars(rating: number): string {
    return '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating);
  }

  reviewStars(rating: number): string {
    const bounded = Math.min(5, Math.max(0, Math.round(rating)));
    return this.toStars(bounded);
  }

  private loadReviews(wcId: number): void {
    this.reviewsLoading.set(true);
    this.reviewsError.set(null);
    this.reviews.set([]);

    this.reviewsService.getByWcId(wcId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviewsError.set('No se pudieron cargar las reviews');
        this.reviewsLoading.set(false);
      },
    });
  }
}
