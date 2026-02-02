import { Component, input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';

import { ReviewsService } from '../services/reviews.service';
import { Review } from '../models/review.model';

@Component({
  standalone: true,
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent {
  private reviewsService = inject(ReviewsService);

  wcId = input<number>();

  reviews = toSignal(
    toObservable(this.wcId).pipe(
      switchMap(id =>
        id ? this.reviewsService.getByWcId(id) : of([])
      )
    ),
    { initialValue: [] }
  );
  
}