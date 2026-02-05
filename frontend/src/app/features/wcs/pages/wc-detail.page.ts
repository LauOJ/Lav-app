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

  loadingWc = signal(false);
  loadingReviews = signal(false);

  errorWc = signal<string | null>(null);
  errorReviews = signal<string | null>(null);

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
      },
      error: () => {
        this.loadingWc.set(false);
        this.errorWc.set('WC no encontrado');
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
  

  // ---- DERIVED STATE ------------------------------------------

  hasUserReviewed = computed(() => {
    const user = this.userState.user();
    if (!user) return false;

    return this.reviews().some(r => r.user_id === user.id);
  });
}
