import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WC } from '../../../core/models/wc.model';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class WcService {
  constructor(private readonly api: ApiService) {}

  list(): Observable<WC[]> {
    return this.api.get<WC[]>('/wcs');
  }

  getById(id: number): Observable<WC> {
    return this.api.get<WC>(`/wcs/${id}`);
  }
}
