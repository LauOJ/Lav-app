import { Component, input } from '@angular/core';
import { Review } from '../models/review.model';

@Component({
  standalone: true,
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent {
  reviews = input<Review[]>([]);
}
