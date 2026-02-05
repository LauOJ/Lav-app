import { Component, input, output, signal, effect } from '@angular/core';
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
  save = output<{
    reviewId: number;
    cleanliness_rating: number;
    safety_rating: number;
    comment?: string;
  }>();

  // estado local
  isEditing = signal(false);

  // campos editables locales
  cleanliness = signal(0);
  safety = signal(0);
  comment = signal<string | undefined>(undefined);

  constructor() {
    // sincroniza los valores editables con la review actual
    effect(() => {
      const r = this.review();
      this.cleanliness.set(r.cleanliness_rating);
      this.safety.set(r.safety_rating);
      this.comment.set(r.comment);
    });
  }

  isMine(): boolean {
    const user = this.currentUser();
    return !!user && this.review().user_id === user.id;
  }

  onEdit() {
    this.isEditing.set(true);
  }

  onCancel() {
    this.isEditing.set(false);
    const r = this.review();
    this.cleanliness.set(r.cleanliness_rating);
    this.safety.set(r.safety_rating);
    this.comment.set(r.comment);
  }

  onDelete() {
    this.delete.emit(this.review().id);
  }

  onSave() {
    this.save.emit({
      reviewId: this.review().id,
      cleanliness_rating: this.cleanliness(),
      safety_rating: this.safety(),
      comment: this.comment(),
    });
    this.isEditing.set(false);
  }
}
