import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { WCService } from '../services/wc.service';
import { WCCreate } from '../models/wc.model';

@Component({
  selector: 'app-wc-form-page',
  imports: [RouterModule],
  templateUrl: './wc-form.page.html',
  styles: [
    '.fieldset-reset { border: none; margin: 0 0 1.25rem 0; padding: 0; }',
  ],
})
export class WCFormPage {
  private readonly wcService = inject(WCService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly editId = signal<number | null>(null);
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
  readonly loadingWc = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (idParam && id != null && !Number.isNaN(id)) {
      this.isEditMode.set(true);
      this.editId.set(id);
      this.loadWcForEdit(id);
      return;
    }

    const latParam = this.route.snapshot.queryParamMap.get('lat');
    const lngParam = this.route.snapshot.queryParamMap.get('lng');
    const latitude = latParam ? Number(latParam) : null;
    const longitude = lngParam ? Number(lngParam) : null;

    if (latitude != null && !Number.isNaN(latitude)) {
      this.form.update(f => ({
        ...f,
        latitude,
      }));
    }

    if (longitude != null && !Number.isNaN(longitude)) {
      this.form.update(f => ({
        ...f,
        longitude,
      }));
    }
  }

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

    if (this.isEditMode()) {
      const wcId = this.editId();
      if (wcId == null) {
        this.error.set('WC no válido');
        this.loading.set(false);
        return;
      }
      this.wcService.updateWC(wcId, formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/wcs', wcId]);
        },
        error: () => {
          this.error.set('Error al actualizar el WC');
          this.loading.set(false);
        },
      });
      return;
    }

    this.wcService.createWC(formData).subscribe({
      next: (wc) => {
        this.loading.set(false);
        this.router.navigate(['/wcs', wc.id, 'reviews', 'new'], {
          state: { justCreated: true },
        });
      },
      error: () => {
        this.error.set('Error al crear el WC');
        this.loading.set(false);
      },
    });
  }

  private loadWcForEdit(id: number): void {
    this.loadingWc.set(true);
    this.error.set(null);
    this.wcService.getById(id).subscribe({
      next: (wc) => {
        this.form.set({
          name: wc.name,
          latitude: wc.latitude,
          longitude: wc.longitude,
          accessible: wc.accessible,
          gender_neutral: wc.gender_neutral,
          has_changing_table: wc.has_changing_table,
          only_for_customers: wc.only_for_customers,
          has_intimate_hygiene_products: wc.has_intimate_hygiene_products,
          description: wc.description ?? '',
        });
        this.loadingWc.set(false);
      },
      error: () => {
        this.error.set('WC no encontrado');
        this.loadingWc.set(false);
      },
    });
  }
}
