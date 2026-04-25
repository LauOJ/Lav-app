import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink, TranslatePipe, LucideIconComponent],
  templateUrl: './privacy.page.html',
  styleUrl: './privacy.page.css',
})
export class PrivacyPage {}
