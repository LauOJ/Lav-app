import { Component, Input } from '@angular/core';

import { WC } from '../../../core/models/wc.model';

@Component({
  selector: 'app-wc-card',
  template: `
    <article class="card">
      <header>
        <h3>{{ wc.name }}</h3>
        <p class="meta">#{{ wc.id }}</p>
      </header>
      <p class="description" *ngIf="wc.description">{{ wc.description }}</p>
      <div class="flags">
        <span *ngIf="wc.accessible">Accessible</span>
        <span *ngIf="wc.gender_neutral">Gender neutral</span>
        <span *ngIf="wc.has_changing_table">Changing table</span>
        <span *ngIf="wc.only_for_customers">Customers only</span>
        <span *ngIf="wc.has_intimate_hygiene_products">Hygiene products</span>
      </div>
    </article>
  `,
  styles: [
    `
      .card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
        display: grid;
        gap: 0.5rem;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }

      .meta {
        color: #6b7280;
        font-size: 0.8rem;
      }

      .flags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #111827;
      }

      .flags span {
        padding: 0.2rem 0.5rem;
        background: #f3f4f6;
        border-radius: 999px;
      }
    `
  ]
})
export class WcCardComponent {
  @Input({ required: true }) wc!: WC;
}
