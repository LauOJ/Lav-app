import { Component, output, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './onboarding-modal.component.html',
  styleUrl: './onboarding-modal.component.css',
})
export class OnboardingModalComponent {
  dismissed = output<void>();

  readonly totalSlides = 3;
  readonly slides = [1, 2, 3];
  readonly currentSlide = signal(1);
  readonly isFirst = computed(() => this.currentSlide() === 1);
  readonly isLast = computed(() => this.currentSlide() === this.totalSlides);

  goNext(): void {
    if (this.isLast()) {
      this.dismiss();
    } else {
      this.currentSlide.update(s => s + 1);
    }
  }

  goPrev(): void {
    if (!this.isFirst()) {
      this.currentSlide.update(s => s - 1);
    }
  }

  goToSlide(n: number): void {
    this.currentSlide.set(n);
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}
