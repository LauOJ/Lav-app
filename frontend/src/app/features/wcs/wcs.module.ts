import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WcCardComponent } from './components/wc-card.component';
import { WcFiltersComponent } from './components/wc-filters.component';
import { WcDetailPageComponent } from './pages/wc-detail.page';
import { WcListPageComponent } from './pages/wc-list.page';

const routes: Routes = [
  { path: '', component: WcListPageComponent },
  { path: ':id', component: WcDetailPageComponent }
];

@NgModule({
  declarations: [
    WcCardComponent,
    WcFiltersComponent,
    WcDetailPageComponent,
    WcListPageComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class WcsModule {}
