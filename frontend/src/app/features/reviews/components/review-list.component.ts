import { Component, input } from '@angular/core';
import { Review } from '../models/review.model';
import { User } from '../../../core/user/user.model';
import { ReviewItemComponent } from './review-item.component';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  imports: [ReviewItemComponent],
})
export class ReviewListComponent {
  reviews = input<Review[]>([]);
  currentUser = input<User | null>();

}
