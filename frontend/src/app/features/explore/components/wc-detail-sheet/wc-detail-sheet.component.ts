import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

import { WC } from '../../../wcs/models/wc.model';

@Component({
  selector: 'app-wc-detail-sheet',
  imports: [CommonModule],
  templateUrl: './wc-detail-sheet.component.html',
  styleUrl: './wc-detail-sheet.component.css'
})
export class WcDetailSheet {
  wc = input.required<WC>();
  close = output<void>();
  readonly sheetState = signal<'collapsed' | 'expanded'>('collapsed');
  readonly isExpanded = computed(() => this.sheetState() === 'expanded');

  constructor() {
    effect(() => {
      this.wc();
      this.sheetState.set('collapsed');
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onExpand(): void {
    this.sheetState.set(this.isExpanded() ? 'collapsed' : 'expanded');
  }

  onSheetClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) return;
    this.sheetState.set(this.isExpanded() ? 'collapsed' : 'expanded');
  }
}
