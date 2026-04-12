import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { Review } from '../models/review.model';

type ReviewPayload = {
  cleanliness_rating: number;
  felt_safe: boolean | null;
  accessible: boolean | null;
  has_toilet_paper: boolean | null;
  hygiene_products_available: boolean | null;
  could_enter_without_buying: boolean | null;
  has_gender_mixed_option: boolean | null;
  comment?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly api = inject(ApiService);

  getByWcId(wcId: number): Observable<Review[]> {
    return this.api.get<Review[]>(`/wcs/${wcId}/reviews`);
  }

  createReview(data: ReviewPayload & { wc_id: number }) {
    return this.api.post('/reviews', data);
  }
  
  deleteReview(reviewId: number): Observable<void> {
    return this.api.delete<void>(`/reviews/${reviewId}`);
  }

  updateReview(
    reviewId: number,
    data: ReviewPayload
  ) {
    return this.api.put(`/reviews/${reviewId}`, data);
  }
  
}
