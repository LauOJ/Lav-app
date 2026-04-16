import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './about.page.html',
  styleUrl: './about.page.css',
})
export class AboutPage {}
