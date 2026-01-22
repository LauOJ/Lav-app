import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Review, ReviewCreate } from '../../../core/models/review.model';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private readonly api: ApiService) {}

  create(payload: ReviewCreate): Observable<Review> {
    return this.api.post<Review>('/reviews', payload);
  }
}
