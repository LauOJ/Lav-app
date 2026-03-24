import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  input,
  signal,
} from '@angular/core';

import { LucideIconComponent, LucideIconName } from '../../../../shared/components/lucide-icon/lucide-icon.component';
import { WC } from '../../../wcs/models/wc.model';

type FeatureKey = 'safety_score' | 'accessibility_score' | 'toilet_paper_score';

interface FeatureItem {
  key: FeatureKey;
  label: string;
  icon: LucideIconName;
  score: number | null;
}

@Component({
  selector: 'app-wc-feature-icons',
  imports: [CommonModule, LucideIconComponent],
  templateUrl: './wc-feature-icons.component.html',
  styleUrl: './wc-feature-icons.component.css'
})
export class WcFeatureIconsComponent implements OnDestroy {
  wc = input.required<WC>();

  private readonly features: Array<Omit<FeatureItem, 'score'>> = [
    { key: 'safety_score', label: 'Seguridad', icon: 'lock' },
    { key: 'accessibility_score', label: 'Accesibilidad', icon: 'accessibility' },
    { key: 'toilet_paper_score', label: 'Papel', icon: 'droplets' },
  ];

  readonly featureItems = computed(() => {
    const wc = this.wc();
    return this.features.map((feature) => ({
      ...feature,
      score: wc[feature.key],
    }));
  });
  readonly activeFeature = signal<FeatureKey | null>(null);

  private longPressTimer: number | null = null;
  private readonly longPressDelay = 450;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngOnDestroy(): void {
    this.clearLongPressTimer();
  }

  onPointerDown(event: PointerEvent, featureKey: FeatureKey): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.clearLongPressTimer();
    this.longPressTimer = window.setTimeout(() => {
      this.activeFeature.set(featureKey);
    }, this.longPressDelay);
  }

  onPointerUp(): void {
    this.clearLongPressTimer();
    this.activeFeature.set(null);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;
    if (!target || this.host.nativeElement.contains(target)) return;
    this.activeFeature.set(null);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer === null) return;
    window.clearTimeout(this.longPressTimer);
    this.longPressTimer = null;
  }

  scoreClass(score: number | null): string {
    if (score == null) return 'score-unknown';
    if (score > 0.7) return 'score-good';
    if (score >= 0.4) return 'score-medium';
    return 'score-low';
  }

  scoreLabel(score: number | null): string {
    if (score == null) return 'Sin datos';
    return `${Math.round(score * 100)}%`;
  }
}
