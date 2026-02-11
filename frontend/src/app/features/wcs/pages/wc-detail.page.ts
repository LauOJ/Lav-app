import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { WCService } from '../services/wc.service';
import { ReviewsService } from '../../reviews/services/reviews.service';
import { ReviewListComponent } from '../../reviews/components/review-list.component';
import { UserState } from '../../../core/user/user.state';
import { Review } from '../../reviews/models/review.model';
import { WC } from '../models/wc.model';

@Component({
  selector: 'app-wc-detail-page',
  templateUrl: './wc-detail.page.html',
  imports: [ReviewListComponent, RouterModule],
})
export class WcDetailPage {
  private route = inject(ActivatedRoute);
  private wcService = inject(WCService);
  private reviewsService = inject(ReviewsService);
  public readonly userState = inject(UserState);

  // ---- STATE --------------------------------------------------

  wc = signal<WC | null>(null);
  reviews = signal<Review[]>([]);
  readonly sortedReviews = computed(() =>
    [...this.reviews()].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );

  loadingWc = signal(false);
  loadingReviews = signal(false);

  errorWc = signal<string | null>(null);
  errorReviews = signal<string | null>(null);

  isFavorite = signal<boolean>(false);
  favoriteError = signal<string | null>(null);

  // ---- INIT ---------------------------------------------------

  constructor() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = Number(idParam);

      if (!idParam || Number.isNaN(id)) {
        this.errorWc.set('WC no válido');
        return;
      }

      this.loadWc(id);
    });
  }

  // ---- LOADERS ------------------------------------------------

  private loadWc(id: number) {
    this.loadingWc.set(true);
    this.errorWc.set(null);

    this.wcService.getById(id).subscribe({
      next: wc => {
        this.wc.set(wc);
        this.loadingWc.set(false);
        this.loadReviews();
        this.loadFavoriteState(wc.id);
      },
      error: () => {
        this.loadingWc.set(false);
        this.errorWc.set('WC no encontrado');
      },
    });
  }

  private loadFavoriteState(wcId: number) {
    if (!this.userState.user()) {
      this.isFavorite.set(false);
      return;
    }
    this.favoriteError.set(null);
    this.wcService.getMyFavorites().subscribe({
      next: favorites => {
        this.isFavorite.set(favorites.some(w => w.id === wcId));
      },
      error: () => {
        this.isFavorite.set(false);
      },
    });
  }

  private loadReviews() {
    const wc = this.wc();
    if (!wc) return;

    this.loadingReviews.set(true);
    this.errorReviews.set(null);

    this.reviewsService.getByWcId(wc.id).subscribe({
      next: reviews => {
        this.reviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: () => {
        this.loadingReviews.set(false);
        this.errorReviews.set('Error al cargar las reviews');
      },
    });
  }

  // ---- EVENTS -------------------------------------------------

  onReviewDeleted() {
    this.loadReviews();
  }

  onReviewUpdated() {
    this.loadReviews();
  }

  onToggleFavorite() {
    const wc = this.wc();
    if (!wc || !this.userState.user()) return;

    this.favoriteError.set(null);
    const wasFavorite = this.isFavorite();

    if (wasFavorite) {
      this.isFavorite.set(false);
      this.wcService.removeFavorite(wc.id).subscribe({
        error: () => {
          this.isFavorite.set(true);
          this.favoriteError.set('No se pudo quitar de favoritos.');
        },
      });
    } else {
      this.isFavorite.set(true);
      this.wcService.addFavorite(wc.id).subscribe({
        error: () => {
          this.isFavorite.set(false);
          this.favoriteError.set('No se pudo añadir a favoritos.');
        },
      });
    }
  }

  // ---- DERIVED STATE ------------------------------------------

  hasUserReviewed = computed(() => {
    const user = this.userState.user();
    if (!user) return false;

    return this.reviews().some(r => r.user_id === user.id);
  });

  readonly safeSpaceSummaryMessage = computed<string | null>(() => {
    const reviews = this.reviews();

    let perceivedSafeCount = 0;
    let perceivedNotAlwaysSafeCount = 0;

    for (const review of reviews) {
      if (review.is_safe_space === true) {
        perceivedSafeCount++;
      } else if (review.is_safe_space === false) {
        perceivedNotAlwaysSafeCount++;
      }
    }

    const totalConsidered = perceivedSafeCount + perceivedNotAlwaysSafeCount;
    if (totalConsidered === 0) {
      return null;
    }

    if (perceivedSafeCount > 0 && perceivedNotAlwaysSafeCount === 0) {
      return 'Según las reviews disponibles, este espacio se percibe como seguro.';
    }

    if (perceivedNotAlwaysSafeCount > 0 && perceivedSafeCount === 0) {
      return 'Según las reviews disponibles, este espacio no siempre se percibe como seguro.';
    }

    return 'Las opiniones sobre la seguridad de este espacio son variadas.';
  });
}
