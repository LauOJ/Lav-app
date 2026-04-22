import { Component, input, output, signal, effect } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Review } from '../models/review.model';
import { User } from '../../../core/user/user.model';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  imports: [TranslatePipe],
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
    step_free_access: boolean | null;
    wide_door: boolean | null;
    turning_space: boolean | null;
    has_grab_bars: boolean | null;
    has_toilet_paper: boolean | null;
    hygiene_products_available: boolean | null;
    menstrual_cup_suitable: boolean | null;
    could_enter_without_buying: boolean | null;
    has_gender_mixed_option: boolean | null;
    has_changing_table: boolean | null;
    changing_table_location: 'mens' | 'womens' | 'mixed' | null;
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
      step_free_access: this.review().step_free_access,
      wide_door: this.review().wide_door,
      turning_space: this.review().turning_space,
      has_grab_bars: this.review().has_grab_bars,
      has_toilet_paper: this.review().has_toilet_paper,
      hygiene_products_available: this.review().hygiene_products_available,
      menstrual_cup_suitable: this.review().menstrual_cup_suitable,
      could_enter_without_buying: this.review().could_enter_without_buying,
      has_gender_mixed_option: this.review().has_gender_mixed_option,
      has_changing_table: this.review().has_changing_table,
      changing_table_location: this.review().changing_table_location,
      comment: this.comment(),
    });
    this.isEditing.set(false);
  }
}
