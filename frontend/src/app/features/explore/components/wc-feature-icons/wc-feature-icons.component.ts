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

type FeatureKey = keyof Pick<
  WC,
  | 'accessible'
  | 'gender_neutral'
  | 'has_changing_table'
  | 'has_intimate_hygiene_products'
>;

interface FeatureItem {
  key: FeatureKey;
  label: string;
  icon: LucideIconName;
}

@Component({
  selector: 'app-wc-feature-icons',
  imports: [CommonModule, LucideIconComponent],
  templateUrl: './wc-feature-icons.component.html',
  styleUrl: './wc-feature-icons.component.css'
})
export class WcFeatureIconsComponent implements OnDestroy {
  wc = input.required<WC>();

  private readonly features: FeatureItem[] = [
    { key: 'accessible', label: 'Accesible', icon: 'accessibility' },
    { key: 'gender_neutral', label: 'Neutral', icon: 'non-binary' },
    { key: 'has_changing_table', label: 'Cambiador', icon: 'baby' },
    {
      key: 'has_intimate_hygiene_products',
      label: 'Higiene íntima',
      icon: 'droplets',
    },
  ];

  readonly featureItems = computed(() =>
    this.features.filter(feature => this.wc()[feature.key])
  );
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
}
