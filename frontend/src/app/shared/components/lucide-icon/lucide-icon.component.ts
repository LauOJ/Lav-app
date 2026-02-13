import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LucideIconName =
  | 'accessibility'
  | 'non-binary'
  | 'baby'
  | 'droplets'
  | 'star'
  | 'lock';

@Component({
  selector: 'app-lucide-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="iconSrc()"
      [alt]="''"
      width="18"
      height="18"
      class="lucide-icon-img"
      aria-hidden="true"
      loading="eager"
    />
  `,
  host: {
    class: 'lucide-icon',
  },
})
export class LucideIconComponent {
  icon = input.required<LucideIconName>();

  /** Path to SVG in public/media/icons (e.g. /media/icons/accessibility.svg) */
  protected readonly iconSrc = computed(() => `/media/icons/${this.icon()}.svg`);
}
