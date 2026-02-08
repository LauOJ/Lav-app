import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  output,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

import { WC } from '../../../wcs/models/wc.model';

@Component({
  selector: 'app-map-view',
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})
export class MapViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  wcs = input.required<WC[]>();
  wcSelected = output<number>();
  selectedWcId = input<number | null>(null);

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private readonly markers = L.layerGroup();
  private readonly markerById = new Map<number, L.Marker>();

  ngAfterViewInit(): void {
    this.setupMap();
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wcs']) {
      this.renderMarkers();
    }

    if (changes['selectedWcId']) {
      this.centerOnSelectedWc();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private setupMap(): void {
    if (this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
    }).setView([40.4168, -3.7038], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markers.addTo(this.map);
    this.setDefaultMarkerIcons();
  }

  private renderMarkers(): void {
    if (!this.map) return;
  
    this.markers.clearLayers();
    this.markerById.clear();
  
    for (const wc of this.wcs() ?? []) {
      if (wc.latitude == null || wc.longitude == null) continue;
  
      const marker = L.marker([wc.latitude, wc.longitude]);
      marker.on('click', () => this.wcSelected.emit(wc.id));
  
      marker.addTo(this.markers);
      this.markerById.set(wc.id, marker);
    }
  }
  

  private setDefaultMarkerIcons(): void {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }

  private centerOnSelectedWc(): void {
    const selectedWcId = this.selectedWcId();
    if (!this.map || selectedWcId == null) return;
  
    const marker = this.markerById.get(selectedWcId);
    if (!marker) return;
  
    this.map.setView(marker.getLatLng(), 16, { animate: true });
    marker.openPopup();
  }
  
}
