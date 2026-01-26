// Extensions au composant map existant
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { SignalementService } from '../../services/signalement.service';
import { Signalement } from '../../models/signalement.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private tileServerUrl = '/tiles/styles/basic-preview/{z}/{x}/{y}.png';
  private antananarivoCenter: L.LatLngExpression = [-18.8792, 47.5236];
  private defaultZoom = 13;
  private signalementMarkers: L.Marker[] = [];
  
  @ViewChild('map') mapContainer!: ElementRef;
  
  signalements: Signalement[] = [];
  selectedSignalement: Signalement | null = null;
  showSignalementForm = false;
  newSignalementPosition: L.LatLng | null = null;

  constructor(
    private signalementService: SignalementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadSignalements();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.antananarivoCenter,
      zoom: this.defaultZoom,
      minZoom: 0,
      maxZoom: 14
    });

    L.tileLayer(this.tileServerUrl, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 14,
      errorTileUrl: 'assets/placeholder-tile.png'
    }).addTo(this.map);

    L.control.scale({
      metric: true,
      imperial: false,
      position: 'bottomleft'
    }).addTo(this.map);

    // Gestionnaire de clic pour créer des signalements
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.authService.isAdmin()) {
        this.newSignalementPosition = e.latlng;
        this.showSignalementForm = true;
      }
    });

    console.log('Carte initialisée avec succès');
  }

  private loadSignalements(filters?: any): void {
    this.signalementService.getSignalements(filters).subscribe({
      next: (signalements) => {
        this.signalements = signalements;
        this.clearMarkers();
        this.addSignalementMarkers();
      },
      error: (error) => {
        console.error('Erreur chargement signalements:', error);
      }
    });
  }

  private clearMarkers(): void {
    this.signalementMarkers.forEach(marker => marker.remove());
    this.signalementMarkers = [];
  }

  private addSignalementMarkers(): void {
    this.signalements.forEach(signalement => {
      const marker = L.marker([
        signalement.localisation.lat,
        signalement.localisation.lng
      ], {
        icon: this.getStatusIcon(signalement.statut_actuel?.valeur || 1)
      }).addTo(this.map);

      // Popup avec informations détaillées
      const popupContent = this.createPopupContent(signalement);
      marker.bindPopup(popupContent);

      // Événements
      marker.on('mouseover', () => {
        this.selectedSignalement = signalement;
        marker.openPopup();
      });

      marker.on('click', () => {
        this.selectedSignalement = signalement;
        // TODO: Ouvrir un modal de détails
      });

      this.signalementMarkers.push(marker);
    });
  }

  private getStatusIcon(statusValue: number): L.Icon {
    const colors = {
      1: 'red',    // Nouveau
      2: 'orange', // En cours
      3: 'green',  // Terminé
      4: 'gray'    // Annulé
    };
    
    const color = colors[statusValue as keyof typeof colors] || 'blue';
    
    return L.icon({
      iconUrl: `assets/markers/marker-${color}.png`,
      shadowUrl: 'assets/markers/marker-shadow.png',
      iconSize: [30, 46],
      iconAnchor: [15, 46],
      popupAnchor: [0, -40]
    });
  }

  private createPopupContent(signalement: Signalement): string {
    return `
      <div class="signalement-popup">
        <h6>Signalement #${signalement.id}</h6>
        <p><strong>Date:</strong> ${signalement.date_creation}</p>
        <p><strong>Surface:</strong> ${signalement.surface} m²</p>
        <p><strong>Budget:</strong> ${signalement.budget.toLocaleString()} MGA</p>
        <p><strong>Statut:</strong> ${signalement.statut_actuel?.nom || 'N/A'}</p>
        <button class="btn btn-sm btn-info" onclick="angularComponentReference.updateStatus(${signalement.id})">
          Modifier statut
        </button>
      </div>
    `;
  }

  // Méthodes existantes...
  public zoomIn(): void {
    this.map.zoomIn();
  }

  public zoomOut(): void {
    this.map.zoomOut();
  }

  public resetView(): void {
    this.map.setView(this.antananarivoCenter, this.defaultZoom);
  }

  public updateStatus(signalementId: number): void {
    // TODO: Implémenter la modification de statut
    console.log('Modifier statut pour:', signalementId);
  }

  public onFiltersChanged(filters: any): void {
    this.loadSignalements(filters);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}