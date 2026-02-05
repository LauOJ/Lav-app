import { Component, input, output } from '@angular/core';
import { Review } from '../models/review.model';
import { User } from '../../../core/user/user.model';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
})
export class ReviewItemComponent {
  review = input.required<Review>();
  currentUser = input<User | null>();

  delete = output<number>();
  
  isMine(): boolean {
    const user = this.currentUser();
    return !!user && this.review().user_id === user.id;
  }

  onDelete() {
    this.delete.emit(this.review().id);
  }
}
