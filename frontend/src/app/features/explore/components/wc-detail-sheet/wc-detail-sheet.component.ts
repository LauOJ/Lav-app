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
import { wcDistanceMeters } from '../../../wcs/utils/wc.utils';
import { WcDetailContentComponent } from '../../../wcs/components/wc-detail-content/wc-detail-content.component';
import { WcFeatureIconsComponent } from '../wc-feature-icons/wc-feature-icons.component';
import { ReviewsService } from '../../../reviews/services/reviews.service';
import { Review } from '../../../reviews/models/review.model';
import { UserState } from '../../../../core/user/user.state';
import { WCService } from '../../../wcs/services/wc.service';

@Component({
  selector: 'app-wc-detail-sheet',
  imports: [CommonModule, RouterModule, WcFeatureIconsComponent, WcDetailContentComponent],
  templateUrl: './wc-detail-sheet.component.html',
  styleUrl: './wc-detail-sheet.component.css'
})
export class WcDetailSheet implements AfterViewInit, OnDestroy {
  private readonly reviewsService = inject(ReviewsService);
  private readonly wcService = inject(WCService);
  readonly userState = inject(UserState);

  readonly isFavorite = signal(false);
  readonly favoriteLoading = signal(false);

  @ViewChild('closeButton') closeButtonRef?: ElementRef<HTMLButtonElement>;

  wc = input.required<WC>();
  userLocation = input<{ lat: number; lng: number } | null>(null);
  close = output<void>();

  private previousFocus: HTMLElement | null = null;
  private readonly keydownHandler = (event: KeyboardEvent) => this.handleKeydown(event);
  readonly sheetState = signal<'collapsed' | 'expanded'>('collapsed');
  readonly isExpanded = computed(() => this.sheetState() === 'expanded');
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
      const wc = this.wc();
      this.sheetState.set('collapsed');
      this.showReviews.set(false);
      this.isFavorite.set(false);
      if (this.userState.isLoggedIn()) {
        this.loadFavoriteState(wc.id);
      }
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

  onToggleFavorite(): void {
    if (this.favoriteLoading()) return;
    this.favoriteLoading.set(true);
    const wasFavorite = this.isFavorite();
    this.isFavorite.set(!wasFavorite);
    const request = wasFavorite
      ? this.wcService.removeFavorite(this.wc().id)
      : this.wcService.addFavorite(this.wc().id);
    request.subscribe({
      error: () => {
        this.isFavorite.set(wasFavorite);
        this.favoriteLoading.set(false);
      },
      complete: () => this.favoriteLoading.set(false),
    });
  }

  private loadFavoriteState(wcId: number): void {
    this.wcService.getMyFavorites().subscribe({
      next: favorites => this.isFavorite.set(favorites.some(w => w.id === wcId)),
      error: () => this.isFavorite.set(false),
    });
  }

  reviewStars(rating: number): string {
    const bounded = Math.min(5, Math.max(0, Math.round(rating)));
    return '★★★★★'.slice(0, bounded) + '☆☆☆☆☆'.slice(0, 5 - bounded);
  }

  private formatDistance(): string | null {
    const location = this.userLocation();
    if (!location) return null;

    const wc = this.wc();
    const distance = wcDistanceMeters(
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
