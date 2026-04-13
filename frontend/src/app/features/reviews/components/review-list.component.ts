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
    updated = output<void>();

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

    onUpdateReview(payload: {
        reviewId: number;
        cleanliness_rating: number;
        felt_safe: boolean | null;
        accessible: boolean | null;
        has_toilet_paper: boolean | null;
        hygiene_products_available: boolean | null;
        could_enter_without_buying: boolean | null;
        has_gender_mixed_option: boolean | null;
        has_changing_table: boolean | null;
        changing_table_location: 'mens' | 'womens' | 'mixed' | null;
        comment?: string;
      }) {
        this.reviewsService
          .updateReview(payload.reviewId, {
            cleanliness_rating: payload.cleanliness_rating,
            felt_safe: payload.felt_safe,
            accessible: payload.accessible,
            has_toilet_paper: payload.has_toilet_paper,
            hygiene_products_available: payload.hygiene_products_available,
            could_enter_without_buying: payload.could_enter_without_buying,
            has_gender_mixed_option: payload.has_gender_mixed_option,
            has_changing_table: payload.has_changing_table,
            changing_table_location: payload.changing_table_location,
            comment: payload.comment,
          })
          .subscribe({
            next: () => {
              this.updated.emit();
            },
            error: () => {
              alert('Error al actualizar la review');
            },
          });
      }
}
