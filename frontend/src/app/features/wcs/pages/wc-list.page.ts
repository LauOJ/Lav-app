import { Component, inject, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WC } from '../models/wc.model';
import { WCService } from '../services/wc.service';

@Component({
  imports: [CommonModule],
  templateUrl: './wc-list.page.html'
})
export class WCListPage {
  private readonly wcService = inject(WCService);

  readonly wcs = signal<WC[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadWCs();
  }

  private loadWCs() {
    this.loading.set(true);
    this.error.set(null);

    this.wcService.getWCs().subscribe({
      next: (wcs: any) => {
        this.wcs.set(wcs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los WCs');
        this.loading.set(false);
      },
    });
  }
}
