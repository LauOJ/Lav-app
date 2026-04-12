import { Component, input, computed } from '@angular/core';

export type LucideIconName =
  | 'accessibility'
  | 'non-binary'
  | 'baby'
  | 'droplets'
  | 'star'
  | 'lock'
  | 'door-open'
  | 'scroll'
  | 'tag'
  | 'spray-can'
  | 'sparkles';

@Component({
  selector: 'app-lucide-icon',
  standalone: true,
  template: `<span class="icon-mask" [style.--icon-url]="iconUrl()"></span>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
    }
    .icon-mask {
      display: block;
      width: 18px;
      height: 18px;
      background-color: currentColor;
      -webkit-mask-image: var(--icon-url);
      mask-image: var(--icon-url);
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
    }
  `],
  host: { class: 'lucide-icon' },
})
export class LucideIconComponent {
  icon = input.required<LucideIconName>();

  protected readonly iconUrl = computed(() => `url(/media/icons/${this.icon()}.svg)`);
}
