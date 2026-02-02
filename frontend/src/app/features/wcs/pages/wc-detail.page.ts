import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { WCService } from '../services/wc.service';

@Component({
  selector: 'app-wc-detail-page',
  templateUrl: './wc-detail.page.html',
})
export class WcDetailPage {
  private route = inject(ActivatedRoute);
  private wcsService = inject(WCService);

  wc = toSignal(
    this.route.paramMap.pipe(
      switchMap(params =>
        this.wcsService.getById(Number(params.get('id')))
      )
    )
  );
}
