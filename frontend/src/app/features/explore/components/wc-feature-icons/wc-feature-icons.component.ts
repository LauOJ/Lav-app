import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LucideIconComponent, LucideIconName } from '../../../../shared/components/lucide-icon/lucide-icon.component';
import { WC } from '../../../wcs/models/wc.model';
import { normalizeWcScore } from '../../../wcs/utils/wc.utils';

type FeatureKey =
  | 'safety_score'
  | 'accessibility_score'
  | 'toilet_paper_score'
  | 'hygiene_products_score'
  | 'free_entry_score'
  | 'gender_mixed_score'
  | 'changing_table_score';

interface FeatureItem {
  key: FeatureKey;
  label: string;
  icon: LucideIconName;
  score: number | null;
}

@Component({
  selector: 'app-wc-feature-icons',
  imports: [CommonModule, LucideIconComponent, TranslatePipe],
  templateUrl: './wc-feature-icons.component.html',
  styleUrl: './wc-feature-icons.component.css'
})
export class WcFeatureIconsComponent implements OnDestroy {
  wc = input.required<WC>();

  // label holds i18n keys, resolved in template via | translate
  private readonly features: Array<Omit<FeatureItem, 'score'>> = [
    { key: 'toilet_paper_score',    label: 'wc_detail.paper',         icon: 'scroll' },
    { key: 'free_entry_score',      label: 'wc_detail.free_entry',    icon: 'tag' },
    { key: 'changing_table_score',  label: 'wc_detail.changing_table',icon: 'baby' },
    { key: 'gender_mixed_score',    label: 'wc_detail.gender_mixed',  icon: 'non-binary' },
    { key: 'safety_score',          label: 'wc_detail.safety',        icon: 'lock' },
    { key: 'accessibility_score',   label: 'wc_detail.accessibility', icon: 'accessibility' },
    { key: 'hygiene_products_score',label: 'wc_detail.hygiene',       icon: 'droplets' },
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
    const normalized = normalizeWcScore(score);
    if (normalized == null) return 'score-unknown';
    if (normalized > 0.7) return 'score-good';
    if (normalized >= 0.4) return 'score-medium';
    return 'score-low';
  }

  /** Returns a percentage string, or null when there is no data. */
  scoreLabel(score: number | null): string | null {
    const normalized = normalizeWcScore(score);
    if (normalized == null) return null;
    return `${Math.round(normalized * 100)}%`;
  }
}
