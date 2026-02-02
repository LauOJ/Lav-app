import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly api = inject(ApiService);

  getByWcId(wcId: number): Observable<Review[]> {
    return this.api.get<Review[]>(`/wcs/${wcId}/reviews`);
  }
}
