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
    felt_safe: [true, Validators.required],
    accessible: [false, Validators.required],
    has_toilet_paper: [false, Validators.required],
    hygiene_products_available: [false, Validators.required],
    could_enter_without_buying: ['' as 'true' | 'false' | ''],
    has_gender_mixed_option: [false, Validators.required],
    comment: [''],
  });

  onSkip() {
    this.router.navigate(['/explore']);
  }

  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const canEnterRaw = raw.could_enter_without_buying;
    const couldEnterWithoutBuying =
      canEnterRaw === '' || canEnterRaw == null
        ? null
        : canEnterRaw === 'true';

    this.reviewsService
      .createReview({
        wc_id: this.wcId,
        cleanliness_rating: raw.cleanliness_rating!,
        felt_safe: !!raw.felt_safe,
        accessible: !!raw.accessible,
        has_toilet_paper: !!raw.has_toilet_paper,
        hygiene_products_available: !!raw.hygiene_products_available,
        could_enter_without_buying: couldEnterWithoutBuying,
        has_gender_mixed_option: !!raw.has_gender_mixed_option,
        comment: raw.comment || undefined,
      })
      .subscribe(() => {
        this.router.navigate(['/wcs', this.wcId]);
      });
  }
}
