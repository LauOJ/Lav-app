import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { WC } from '../../../core/models/wc.model';
import { WcService } from '../services/wc.service';

@Component({
  selector: 'app-wc-list-page',
  template: `
    <section class="page">
      <header>
        <h1>Restrooms</h1>
        <p>Explore nearby options and filter by amenities.</p>
      </header>

      <app-wc-filters></app-wc-filters>

      <section class="grid" *ngIf="wcs$ | async as wcs">
        <app-wc-card *ngFor="let wc of wcs; trackBy: trackById" [wc]="wc" />
        <p *ngIf="wcs.length === 0">No restrooms yet.</p>
      </section>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1.5rem;
      }

      header {
        display: grid;
        gap: 0.25rem;
      }

      .grid {
        display: grid;
        gap: 1rem;
      }
    `
  ]
})
export class WcListPageComponent {
  readonly wcs$: Observable<WC[]> = this.wcService.list();

  constructor(private readonly wcService: WcService) {}

  trackById(_: number, wc: WC): number {
    return wc.id;
  }
}
