import { Component, input } from '@angular/core';
import { Review } from '../models/review.model';
import { User } from '../../../core/user/user.model';

@Component({
  standalone: true,
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent {
  reviews = input<Review[]>([]);
  currentUser = input<User | null>();

}
