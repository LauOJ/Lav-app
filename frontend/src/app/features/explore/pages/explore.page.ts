import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import { WC } from '../../wcs/models/wc.model';
import { WCService } from '../../wcs/services/wc.service';
import { MapViewComponent } from '../components/map-view/map-view.component';
import { WcDetailSheet } from '../components/wc-detail-sheet/wc-detail-sheet.component';

@Component({
  imports: [CommonModule, RouterModule, MapViewComponent, WcDetailSheet],
  templateUrl: './explore.page.html',
  styleUrl: './explore.page.css'
})
export class ExplorePage implements OnInit {
  private readonly wcService = inject(WCService);
  private readonly router = inject(Router);

  readonly selectedWcId = signal<number | null>(null);
  readonly wcs = signal<WC[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly selectedWc = computed(() => {
    const selectedId = this.selectedWcId();
    return this.wcs().find(wc => wc.id === selectedId) ?? null;
  });

  ngOnInit(): void {
    this.loadWcs();
  }

  onSelectWc(id: number): void {
    this.selectedWcId.set(id);
  }

  onCloseSheet(): void {
    this.selectedWcId.set(null);
  }

  onViewDetail(id: number): void {
    this.router.navigate(['/wcs', id]);
  }

  private loadWcs(): void {
    this.loading.set(true);
    this.error.set(null);

    this.wcService.getWCs().subscribe({
      next: (wcs) => {
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
