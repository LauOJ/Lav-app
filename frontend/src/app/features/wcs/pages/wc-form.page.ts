import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { WCService } from '../services/wc.service';
import { WCCreate } from '../models/wc.model';

@Component({
  selector: 'app-wc-form-page',
  imports: [RouterModule],
  templateUrl: './wc-form.page.html',
})
export class WCFormPage {
  private readonly wcService = inject(WCService);
  private readonly router = inject(Router);

  readonly form = signal<WCCreate>({
    name: '',
    latitude: 0,
    longitude: 0,
    accessible: false,
    gender_neutral: false,
    has_changing_table: false,
    only_for_customers: false,
    has_intimate_hygiene_products: false,
    description: '',
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  updateName(value: string) {
    this.form.update(f => ({
      ...f,
      name: value,
    }));
  }

  updateLatitude(value: number) {
    this.form.update(f => ({
      ...f,
      latitude: value,
    }));
  }

  updateLongitude(value: number) {
    this.form.update(f => ({
      ...f,
      longitude: value,
    }));
  }

  updateDescription(value: string) {
    this.form.update(f => ({
      ...f,
      description: value.trim() || null,
    }));
  }

  toggleFlag<K extends keyof WCCreate>(key: K, value: boolean) {
    this.form.update(f => ({
      ...f,
      [key]: value,
    }));
  }

  onSubmit() {
    const formData = this.form();
    
    if (!formData.name.trim() || formData.latitude === 0 || formData.longitude === 0) {
      this.error.set('Nombre, latitud y longitud son obligatorios');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.wcService.createWC(formData).subscribe({
      next: (wc) => {
        this.loading.set(false);
        this.router.navigate(['/wcs', wc.id]);
      },
      error: () => {
        this.error.set('Error al crear el WC');
        this.loading.set(false);
      },
    });
  }
}
