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
    felt_safe: boolean | null;
    accessible: boolean | null;
    has_toilet_paper: boolean | null;
    hygiene_products_available: boolean | null;
    could_enter_without_buying: boolean | null;
    has_gender_mixed_option: boolean | null;
    has_changing_table: boolean | null;
    comment?: string;
  }>();

  // estado local
  isEditing = signal(false);

  // campos editables locales
  cleanliness = signal(0);
  comment = signal<string | undefined>(undefined);

  constructor() {
    // sincroniza los valores editables con la review actual
    effect(() => {
      const r = this.review();
      this.cleanliness.set(r.cleanliness_rating);
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
    this.comment.set(r.comment);
  }

  onDelete() {
    this.delete.emit(this.review().id);
  }

  onSave() {
    this.save.emit({
      reviewId: this.review().id,
      cleanliness_rating: this.cleanliness(),
      felt_safe: this.review().felt_safe,
      accessible: this.review().accessible,
      has_toilet_paper: this.review().has_toilet_paper,
      hygiene_products_available: this.review().hygiene_products_available,
      could_enter_without_buying: this.review().could_enter_without_buying,
      has_gender_mixed_option: this.review().has_gender_mixed_option,
      has_changing_table: this.review().has_changing_table,
      comment: this.comment(),
    });
    this.isEditing.set(false);
  }
}
