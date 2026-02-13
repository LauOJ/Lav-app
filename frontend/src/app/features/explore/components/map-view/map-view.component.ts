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
  addWcAt = output<{ lat: number; lng: number }>();
  selectedWcId = input<number | null>(null);
  userLocation = input<{ lat: number; lng: number; zoom?: number } | null>(null);

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private readonly markers = L.layerGroup();
  private readonly markerById = new Map<number, L.Marker>();
  private readonly addPopup = L.popup({ closeButton: true, autoClose: true });
  private pendingLatLng: L.LatLng | null = null;
  private userMarker: L.Marker | null = null;

  /** Same pin icon as the "Centrar en mi ubicación" button (📍) */
  private readonly userLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<span aria-hidden="true">📍</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

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

    if (changes['userLocation']) {
      this.centerOnUserLocation();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
    this.userMarker = null;
  }

  private setupMap(): void {
    if (this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
    }).setView([41.3874, 2.1686], 12);

    L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markers.addTo(this.map);
    this.setDefaultMarkerIcons();
    this.attachMapHandlers();
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
    const iconRetinaUrl = 'leaflet/marker-icon-2x.png';
    const iconUrl = 'leaflet/marker-icon.png';
    const shadowUrl = 'leaflet/marker-shadow.png';
  
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }
  

  private attachMapHandlers(): void {
    if (!this.map) return;

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.pendingLatLng = event.latlng;
      this.addPopup
        .setLatLng(event.latlng)
        .setContent(
          '<button type="button" class="add-wc-button">Añadir WC aquí</button>'
        );
      this.addPopup.openOn(this.map!);
    });

    this.map.on('popupopen', (event: L.PopupEvent) => {
      if (event.popup !== this.addPopup) return;
      const element = event.popup.getElement();
      const button = element?.querySelector(
        '.add-wc-button'
      ) as HTMLButtonElement | null;
      if (!button) return;
      button.onclick = () => this.onAddWcClicked();
    });

    this.map.on('popupclose', (event: L.PopupEvent) => {
      if (event.popup !== this.addPopup) return;
      this.pendingLatLng = null;
    });
  }

  private onAddWcClicked(): void {
    if (!this.pendingLatLng) return;
    this.addWcAt.emit({
      lat: this.pendingLatLng.lat,
      lng: this.pendingLatLng.lng,
    });
    this.map?.closePopup(this.addPopup);
  }

  private centerOnSelectedWc(): void {
    const selectedWcId = this.selectedWcId();
    if (!this.map || selectedWcId == null) return;
  
    const marker = this.markerById.get(selectedWcId);
    if (!marker) return;
  
    this.map.setView(marker.getLatLng(), 16, { animate: true });
    marker.openPopup();
  }

  private centerOnUserLocation(): void {
    const location = this.userLocation();
    if (!this.map || !location) return;

    const zoom = location.zoom ?? 15;
    const latLng = L.latLng(location.lat, location.lng);
    this.map.setView(latLng, zoom, { animate: true });

    if (!this.userMarker) {
      this.userMarker = L.marker(latLng, {
        icon: this.userLocationIcon,
        title: 'Estás aquí',
      });
      this.userMarker.addTo(this.map);
    } else {
      this.userMarker.setLatLng(latLng);
    }
  }
  
}
