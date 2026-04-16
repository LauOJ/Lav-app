import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, TranslatePipe, LucideIconComponent],
  templateUrl: './about.page.html',
  styleUrl: './about.page.css',
})
export class AboutPage {}
