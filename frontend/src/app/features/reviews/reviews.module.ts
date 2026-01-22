import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ReviewFormComponent } from './components/review-form.component';

const routes: Routes = [{ path: '', component: ReviewFormComponent }];

@NgModule({
  declarations: [ReviewFormComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class ReviewsModule {}
