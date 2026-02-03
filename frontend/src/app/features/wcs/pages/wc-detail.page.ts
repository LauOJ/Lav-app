import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';

import { WCService } from '../services/wc.service';
import { ReviewsService } from '../../reviews/services/reviews.service';
import { ReviewListComponent } from '../../reviews/components/review-list.component';
import { UserState } from '../../../core/user/user.state';
import { Review } from '../../reviews/models/review.model';

@Component({
  selector: 'app-wc-detail-page',
  templateUrl: './wc-detail.page.html',
  imports: [ReviewListComponent, RouterModule],
})
export class WcDetailPage {
  private route = inject(ActivatedRoute);
  private wcsService = inject(WCService);
  private reviewsService = inject(ReviewsService);
  private userState = inject(UserState);

  wc = toSignal(
    this.route.paramMap.pipe(
      switchMap(params =>
        this.wcsService.getById(Number(params.get('id')))
      )
    )
  );

  reviews = toSignal(
    toObservable(this.wc).pipe(
      switchMap(wc =>
        wc ? this.reviewsService.getByWcId(wc.id) : of([])
      )
    ),
    { initialValue: [] as Review[] }
  );

  hasUserReviewed = computed(() => {
    const user = this.userState.user();
    const reviews = this.reviews();
  
    if (!user) return false;
  
    return reviews.some(r => r.user_id === user.id);
  });
  
}
