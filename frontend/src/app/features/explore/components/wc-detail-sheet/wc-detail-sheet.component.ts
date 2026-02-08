import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

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
  viewDetail = output<number>();

  onClose(): void {
    this.close.emit();
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.wc().id);
  }
}
