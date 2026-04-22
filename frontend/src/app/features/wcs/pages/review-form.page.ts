import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ReviewsService } from '../../reviews/services/reviews.service';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  templateUrl: './review-form.page.html',
  styleUrl: './review-form.page.css',
  imports: [ReactiveFormsModule, RouterModule, TranslatePipe, LucideIconComponent],
})
export class ReviewFormPage {
  readonly stars = [1, 2, 3, 4, 5];
  accessibilityOpen = signal(false);
  menstruationOpen = signal(false);
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
    has_toilet_paper: ['' as 'true' | 'false' | ''],
    could_enter_without_buying: ['' as 'true' | 'false' | ''],
    has_changing_table: ['' as 'true' | 'false' | ''],
    changing_table_location: ['' as 'mens' | 'womens' | 'mixed' | ''],
    // Accessibilitat
    accessible: ['' as 'true' | 'false' | ''],
    step_free_access: ['' as 'true' | 'false' | ''],
    wide_door: ['' as 'true' | 'false' | ''],
    turning_space: ['' as 'true' | 'false' | ''],
    has_grab_bars: ['' as 'true' | 'false' | ''],
    // Menstruació
    hygiene_products_available: ['' as 'true' | 'false' | ''],
    menstrual_cup_suitable: ['' as 'true' | 'false' | ''],
    // Sense secció
    has_gender_mixed_option: ['' as 'true' | 'false' | ''],
    felt_safe: ['' as 'true' | 'false' | ''],
    comment: [''],
  });

  toggleAccessibility() {
    this.accessibilityOpen.update(v => !v);
  }

  toggleMenstruation() {
    this.menstruationOpen.update(v => !v);
  }

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
        has_toilet_paper: this.toNullableBool(raw.has_toilet_paper),
        could_enter_without_buying: this.toNullableBool(raw.could_enter_without_buying),
        has_changing_table: this.toNullableBool(raw.has_changing_table),
        changing_table_location: (raw.has_changing_table === 'true' && raw.changing_table_location)
          ? raw.changing_table_location
          : null,
        accessible: this.toNullableBool(raw.accessible),
        step_free_access: this.toNullableBool(raw.step_free_access),
        wide_door: this.toNullableBool(raw.wide_door),
        turning_space: this.toNullableBool(raw.turning_space),
        has_grab_bars: this.toNullableBool(raw.has_grab_bars),
        hygiene_products_available: this.toNullableBool(raw.hygiene_products_available),
        menstrual_cup_suitable: this.toNullableBool(raw.menstrual_cup_suitable),
        has_gender_mixed_option: this.toNullableBool(raw.has_gender_mixed_option),
        felt_safe: this.toNullableBool(raw.felt_safe),
        comment: raw.comment || undefined,
      })
      .subscribe(() => {
        this.router.navigate(['/explore']);
      });
  }
}
