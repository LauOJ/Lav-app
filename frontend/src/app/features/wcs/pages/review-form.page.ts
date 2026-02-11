import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewsService } from '../../reviews/services/reviews.service';

@Component({
  templateUrl: './review-form.page.html',
  imports: [ReactiveFormsModule],
  styles: [
    '.fieldset-reset { border: none; margin: 0; padding: 0; }',
  ],
})
export class ReviewFormPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);

  wcId = Number(this.route.snapshot.paramMap.get('id'));

  form = this.fb.group({
    cleanliness_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    safety_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
    is_safe_space: [null as string | null],
    safe_space_comment: [''],
  });

  /** True when user chose Sí or No (so we show the optional explanation). */
  get showSafeSpaceComment(): boolean {
    const v = this.form.get('is_safe_space')?.value;
    return v === 'true' || v === 'false';
  }

  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const isSafeSpaceRaw = raw.is_safe_space;
    const isSafeSpace =
      isSafeSpaceRaw === '' || isSafeSpaceRaw == null
        ? null
        : isSafeSpaceRaw === 'true';

    this.reviewsService
      .createReview({
        wc_id: this.wcId,
        cleanliness_rating: raw.cleanliness_rating!,
        safety_rating: raw.safety_rating!,
        comment: raw.comment || undefined,
        is_safe_space: isSafeSpace,
        safe_space_comment: this.showSafeSpaceComment ? (raw.safe_space_comment || null) : undefined,
      })
      .subscribe(() => {
        this.router.navigate(['/wcs', this.wcId]);
      });
  }
}
