import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-review-form',
  template: `
    <section class="review-form">
      <h1>Leave a review</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          Restroom ID
          <input type="number" formControlName="wc_id" />
        </label>
        <label>
          Cleanliness (1-5)
          <input type="number" formControlName="cleanliness_rating" />
        </label>
        <label>
          Safety (1-5)
          <input type="number" formControlName="safety_rating" />
        </label>
        <label>
          Comment
          <textarea formControlName="comment"></textarea>
        </label>
        <button type="submit" [disabled]="form.invalid">Submit</button>
      </form>
    </section>
  `,
  styles: [
    `
      .review-form {
        max-width: 480px;
        display: grid;
        gap: 1rem;
      }

      form {
        display: grid;
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.25rem;
      }

      input,
      textarea {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
      }

      textarea {
        min-height: 120px;
        resize: vertical;
      }

      button {
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        border: none;
        background: #111827;
        color: #ffffff;
        cursor: pointer;
      }
    `
  ]
})
export class ReviewFormComponent {
  readonly form = this.formBuilder.nonNullable.group({
    wc_id: [0, [Validators.required, Validators.min(1)]],
    cleanliness_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    safety_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['']
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly reviewService: ReviewService
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.reviewService.create(this.form.getRawValue()).subscribe({
      next: () => this.form.reset({ wc_id: 0, cleanliness_rating: 3, safety_rating: 3, comment: '' })
    });
  }
}
