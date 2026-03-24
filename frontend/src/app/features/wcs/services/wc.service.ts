import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { WC, WCCreate } from '../models/wc.model';

@Injectable({
  providedIn: 'root',
})
export class WCService {
  private readonly api = inject(ApiService);

  getWCs(): Observable<WC[]> {
    return this.api.get<WC[]>('/wcs');
  }

  getById(id: number): Observable<WC> {
    return this.api.get<WC>(`/wcs/${id}`);
  }

  createWC(data: WCCreate): Observable<WC> {
    return this.api.post<WC>('/wcs', data);
  }

  updateWC(id: number, data: Partial<WCCreate>): Observable<WC> {
    return this.api.patch<WC>(`/wcs/${id}`, data);
  }

  getMyFavorites(): Observable<WC[]> {
    return this.api.get<WC[]>('/users/me/favorites');
  }

  addFavorite(wcId: number): Observable<unknown> {
    return this.api.post(`/wcs/${wcId}/favorite`, {});
  }

  removeFavorite(wcId: number): Observable<void> {
    return this.api.delete<void>(`/wcs/${wcId}/favorite`);
  }
}
