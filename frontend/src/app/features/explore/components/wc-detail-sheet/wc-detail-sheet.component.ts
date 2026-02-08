import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { WC } from '../../../wcs/models/wc.model';

@Component({
  selector: 'app-wc-detail-sheet',
  imports: [CommonModule],
  templateUrl: './wc-detail-sheet.component.html',
  styleUrl: './wc-detail-sheet.component.css'
})
export class WcDetailSheet {
  @Input({ required: true }) wc!: WC;
  @Output() close = new EventEmitter<void>();
  @Output() viewDetail = new EventEmitter<number>();

  onClose(): void {
    this.close.emit();
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.wc.id);
  }
}
