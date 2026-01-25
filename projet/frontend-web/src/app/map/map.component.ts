// src/app/map/map.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // <-- Ajouter cette importation
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  constructor(private http: HttpClient) { } // <-- Injecter HttpClient
  private map!: L.Map;
  private tileServerUrl = '/tiles/styles/antananarivo/{z}/{x}/{y}.png';
  
  // Coordonnées d'Antananarivo
  private antananarivoCenter: L.LatLngExpression = [-18.8792, 47.5236];
  private defaultZoom = 13;

  ngOnInit(): void {
    this.testTileAccess();
    this.initMap();
    this.addMarkers();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private testTileAccess(): void {
  // Test avec des coordonnées fixes
  const testUrl = '/tiles/styles/antananarivo/13/4200/3100.png';
  
  console.log('Testing tile access:', testUrl);
  
  this.http.get(testUrl, { responseType: 'blob' }).subscribe(
    (blob) => {
      console.log('✅ Tile loaded successfully, size:', blob.size);
      
      // Créez une URL pour afficher l'image
      const imageUrl = URL.createObjectURL(blob);
      console.log('Image URL:', imageUrl);
      
      // Optionnel: Affichez l'image pour vérifier
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => console.log('✅ Image loaded correctly');
    },
    (error) => {
      console.error('❌ Failed to load tile:', error);
      console.log('Error details:', error.status, error.statusText);
    }
  );
}

  private initMap(): void {
    // Initialiser la carte
    this.map = L.map('map', {
      center: this.antananarivoCenter,
      zoom: this.defaultZoom,
      minZoom: 0,
      maxZoom: 14
    });

    // Ajouter la couche de tuiles depuis notre TileServer offline
    L.tileLayer(this.tileServerUrl, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 14,
      errorTileUrl: 'assets/placeholder-tile.png' // Image de secours si tuile manquante
    }).addTo(this.map);

    // Ajouter un contrôle d'échelle
    L.control.scale({
      metric: true,
      imperial: false,
      position: 'bottomleft'
    }).addTo(this.map);

    console.log('Carte initialisée avec succès');
  }

  private addMarkers(): void {
    // Exemple : Marqueur sur le Palais de la Reine (Rova)
    const rovaMarker = L.marker([-18.9146, 47.5236], {
      icon: this.createCustomIcon('blue')
    }).addTo(this.map);

    rovaMarker.bindPopup('<b>Rova d\'Antananarivo</b><br>Palais de la Reine');

    // Exemple : Marqueur sur le Lac Anosy
    const lanosyMarker = L.marker([-18.9250, 47.5208], {
      icon: this.createCustomIcon('green')
    }).addTo(this.map);

    lanosyMarker.bindPopup('<b>Lac Anosy</b><br>Monument aux morts');

    // Exemple : Zone circulaire autour du centre-ville
    const circle = L.circle(this.antananarivoCenter, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.2,
      radius: 2000
    }).addTo(this.map);

    circle.bindPopup('Centre-ville d\'Antananarivo<br>Rayon: 2km');
  }

  private createCustomIcon(color: string): L.Icon {
    return L.icon({
      iconUrl: `assets/markers/marker-${color}.png`,
      shadowUrl: 'assets/markers/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  // Méthodes publiques pour contrôler la carte depuis le template
  public zoomIn(): void {
    this.map.zoomIn();
  }

  public zoomOut(): void {
    this.map.zoomOut();
  }

  public resetView(): void {
    this.map.setView(this.antananarivoCenter, this.defaultZoom);
  }

  public addCustomMarker(lat: number, lng: number, title: string): void {
    const marker = L.marker([lat, lng]).addTo(this.map);
    marker.bindPopup(title);
  }
}