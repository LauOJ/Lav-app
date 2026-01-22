import { Component } from '@angular/core';

@Component({
  selector: 'app-wc-filters',
  template: `
    <section class="filters">
      <h2>Filters</h2>
      <p>Filter controls will live here.</p>
    </section>
  `,
  styles: [
    `
      .filters {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
        background: #f9fafb;
      }
    `
  ]
})
export class WcFiltersComponent {}
