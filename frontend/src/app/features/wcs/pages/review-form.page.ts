import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewsService } from '../../reviews/services/reviews.service';

@Component({
  templateUrl: './review-form.page.html',
  imports: [ReactiveFormsModule, RouterModule],
  styles: [
    '.fieldset-reset { border: none; margin: 0 0 1.25rem 0; padding: 0; }',
  ],
})
export class ReviewFormPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);

  wcId = Number(this.route.snapshot.paramMap.get('id'));

  readonly justCreated = signal(false);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const fromState = navigation?.extras?.state as { justCreated?: boolean } | undefined;
    if (fromState?.justCreated === true) {
      this.justCreated.set(true);
    }
  }

  form = this.fb.group({
    cleanliness_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    felt_safe: ['' as 'true' | 'false' | ''],
    accessible: ['' as 'true' | 'false' | ''],
    has_toilet_paper: ['' as 'true' | 'false' | ''],
    hygiene_products_available: ['' as 'true' | 'false' | ''],
    could_enter_without_buying: ['' as 'true' | 'false' | ''],
    has_gender_mixed_option: ['' as 'true' | 'false' | ''],
    has_changing_table: ['' as 'true' | 'false' | ''],
    comment: [''],
  });

  onSkip() {
    this.router.navigate(['/explore']);
  }

  private toNullableBool(value: 'true' | 'false' | '' | null): boolean | null {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  }

  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    this.reviewsService
      .createReview({
        wc_id: this.wcId,
        cleanliness_rating: raw.cleanliness_rating!,
        felt_safe: this.toNullableBool(raw.felt_safe),
        accessible: this.toNullableBool(raw.accessible),
        has_toilet_paper: this.toNullableBool(raw.has_toilet_paper),
        hygiene_products_available: this.toNullableBool(raw.hygiene_products_available),
        could_enter_without_buying: this.toNullableBool(raw.could_enter_without_buying),
        has_gender_mixed_option: this.toNullableBool(raw.has_gender_mixed_option),
        has_changing_table: this.toNullableBool(raw.has_changing_table),
        comment: raw.comment || undefined,
      })
      .subscribe(() => {
        this.router.navigate(['/explore']);
      });
  }
}
