import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { WC } from '../../../core/models/wc.model';
import { WcService } from '../services/wc.service';

@Component({
  selector: 'app-wc-detail-page',
  template: `
    <section class="page">
      <ng-container *ngIf="wc$ | async as wc; else missing">
        <h1>{{ wc.name }}</h1>
        <p *ngIf="wc.description">{{ wc.description }}</p>
        <app-wc-card [wc]="wc" />
      </ng-container>
      <ng-template #missing>
        <p>Restroom not found.</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1rem;
      }
    `
  ]
})
export class WcDetailPageComponent {
  readonly wc$: Observable<WC | null> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) => (Number.isNaN(id) ? of(null) : this.wcService.getById(id))),
    catchError(() => of(null))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly wcService: WcService
  ) {}
}
