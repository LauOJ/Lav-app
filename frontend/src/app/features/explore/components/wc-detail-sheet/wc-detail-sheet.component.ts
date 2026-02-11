import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { WC } from '../../../wcs/models/wc.model';
import { WcFeatureIconsComponent } from '../wc-feature-icons/wc-feature-icons.component';
import { ReviewsService } from '../../../reviews/services/reviews.service';
import { Review } from '../../../reviews/models/review.model';

@Component({
  selector: 'app-wc-detail-sheet',
  imports: [CommonModule, RouterModule, WcFeatureIconsComponent],
  templateUrl: './wc-detail-sheet.component.html',
  styleUrl: './wc-detail-sheet.component.css'
})
export class WcDetailSheet implements AfterViewInit, OnDestroy {
  private readonly reviewsService = inject(ReviewsService);

  @ViewChild('closeButton') closeButtonRef?: ElementRef<HTMLButtonElement>;

  wc = input.required<WC>();
  userLocation = input<{ lat: number; lng: number } | null>(null);
  close = output<void>();

  private previousFocus: HTMLElement | null = null;
  private readonly keydownHandler = (event: KeyboardEvent) => this.handleKeydown(event);
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
  readonly distanceLabel = computed(() => this.formatDistance());
  readonly showReviews = signal(false);
  readonly reviews = signal<Review[]>([]);
  readonly reviewsLoading = signal(false);
  readonly reviewsError = signal<string | null>(null);
  readonly sortedReviews = computed(() =>
    [...this.reviews()].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );
  readonly visibleReviews = computed(() => this.sortedReviews().slice(0, 3));
  readonly hasMoreReviews = computed(() => this.wc().reviews_count > 3);

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

  ngAfterViewInit(): void {
    this.previousFocus = document.activeElement as HTMLElement | null;
    setTimeout(() => {
      this.closeButtonRef?.nativeElement?.focus();
    }, 0);
    document.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keydownHandler);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose();
    }
  }

  onClose(): void {
    if (this.previousFocus?.focus) {
      this.previousFocus.focus();
    }
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

  private formatDistance(): string | null {
    const location = this.userLocation();
    if (!location) return null;

    const wc = this.wc();
    const distance = this.distanceMeters(
      location.lat,
      location.lng,
      wc.latitude,
      wc.longitude
    );

    if (distance < 1000) {
      return `≈ ${Math.round(distance)} m`;
    }
    const km = Math.round((distance / 1000) * 10) / 10;
    return `≈ ${km} km`;
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
