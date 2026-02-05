import { Component, input, output, inject } from '@angular/core';
import { ReviewsService } from '../services/reviews.service';
import { Review } from '../models/review.model';
import { User } from '../../../core/user/user.model';
import { ReviewItemComponent } from './review-item.component';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  imports: [ReviewItemComponent],
})
export class ReviewListComponent {
    reviews = input.required<Review[]>();
    currentUser = input<User | null>();
  
    deleted = output<void>();
  
    private readonly reviewsService = inject(ReviewsService);
  
    onDeleteReview(reviewId: number) {
      const confirmed = confirm('¿Seguro que quieres borrar esta review?');
      if (!confirmed) return;
  
      this.reviewsService.deleteReview(reviewId).subscribe({
        next: () => {
          this.deleted.emit();
        },
        error: () => {
          alert('Error al borrar la review');
        },
      });
    }
}
