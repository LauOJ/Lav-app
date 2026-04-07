import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { WC } from '../../models/wc.model';
import { wcCleanlinessStars, wcHasLimitedInfo, wcScorePercentage } from '../../utils/wc.utils';

@Component({
  selector: 'app-wc-detail-content',
  imports: [CommonModule],
  templateUrl: './wc-detail-content.component.html',
  styleUrl: './wc-detail-content.component.css',
})
export class WcDetailContentComponent {
  wc = input.required<WC>();

  readonly cleanlinessStars = computed(() =>
    wcCleanlinessStars(this.wc().avg_cleanliness)
  );

  readonly cleanlinessValue = computed(() => {
    if (this.wc().reviews_count === 0 || this.wc().avg_cleanliness == null) return null;
    return this.wc().avg_cleanliness;
  });

  readonly safetyPercentage = computed(() =>
    wcScorePercentage(this.wc().safety_score)
  );

  readonly accessibilityPercentage = computed(() =>
    wcScorePercentage(this.wc().accessibility_score)
  );

  readonly toiletPaperPercentage = computed(() =>
    wcScorePercentage(this.wc().toilet_paper_score)
  );

  readonly hygieneProductsPercentage = computed(() =>
    wcScorePercentage(this.wc().hygiene_products_score)
  );

  readonly freeEntryPercentage = computed(() =>
    wcScorePercentage(this.wc().free_entry_score)
  );

  readonly genderMixedPercentage = computed(() =>
    wcScorePercentage(this.wc().gender_mixed_score)
  );

  readonly hasLimitedInfo = computed(() =>
    wcHasLimitedInfo(this.wc().reviews_count)
  );
}
