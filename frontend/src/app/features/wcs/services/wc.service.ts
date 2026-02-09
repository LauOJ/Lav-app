import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { WC, WCCreate } from '../models/wc.model';
import { WCFilters } from '../models/wc-filters.model';

@Injectable({
  providedIn: 'root',
})
export class WCService {
    private readonly api = inject(ApiService);

    getWCs(filters?: WCFilters): Observable<WC[]> {
      let params = new HttpParams();
  
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params = params.set(key, String(value));
          }
        });
      }
  
      return this.api.get<WC[]>('/wcs', { params });
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
}
