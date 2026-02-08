import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewsService } from '../../reviews/services/reviews.service';

@Component({
  templateUrl: './review-form.page.html',
  imports: [ReactiveFormsModule],
})
export class ReviewFormPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);

  wcId = Number(this.route.snapshot.paramMap.get('id'));

  form = this.fb.nonNullable.group({
    cleanliness_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    safety_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
  });

  submit() {
    if (this.form.invalid) return;

    this.reviewsService
      .createReview({
        wc_id: this.wcId,
        ...this.form.getRawValue(),
      })
      .subscribe(() => {
        this.router.navigate(['/wcs', this.wcId]);
      });
  }
}
