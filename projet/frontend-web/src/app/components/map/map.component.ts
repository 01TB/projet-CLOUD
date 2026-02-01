// src/app/components/map/map.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { Signalement, StatistiquesRecap, StatutAvancement } from '../../models/signalement.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  private map!: L.Map;
  private tileServerUrl = '/tiles/styles/basic-preview/{z}/{x}/{y}.png';
  private antananarivoCenter: L.LatLngExpression = [-18.8792, 47.5236];
  private defaultZoom = 13;
  private signalementMarkers: L.Marker[] = [];
  private subscriptions = new Subscription();
  
  signalements: Signalement[] = [];
  statistiques: StatistiquesRecap | null = null;
  statuts: StatutAvancement[] = [];
  selectedSignalement: Signalement | null = null;
  showStatusModal = false;
  newStatusId: number | null = null;
  
  isManager = false;
  showRecapModal = false;

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isManager = this.authService.isManager();
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  private loadData(): void {
    const sigSub = this.mockDataService.getSignalements().subscribe(signalements => {
      this.signalements = signalements;
      if (this.map) {
        this.addSignalementMarkers();
      }
    });

    const statsSub = this.mockDataService.getStatistiques().subscribe(stats => {
      this.statistiques = stats;
    });

    const statutsSub = this.mockDataService.getStatuts().subscribe(statuts => {
      this.statuts = statuts;
    });

    this.subscriptions.add(sigSub);
    this.subscriptions.add(statsSub);
    this.subscriptions.add(statutsSub);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.antananarivoCenter,
      zoom: this.defaultZoom,
      minZoom: 10,
      maxZoom: 18
    });

    L.tileLayer(this.tileServerUrl, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      errorTileUrl: 'assets/placeholder-tile.png'
    }).addTo(this.map);

    L.control.scale({
      metric: true,
      imperial: false,
      position: 'bottomleft'
    }).addTo(this.map);

    this.addSignalementMarkers();
    console.log('Carte initialisée avec succès');
  }

  private addSignalementMarkers(): void {
    this.clearMarkers();

    this.signalements.forEach(signalement => {
      const marker = L.marker(
        [signalement.localisation.lat, signalement.localisation.lng],
        { icon: this.getStatusIcon(signalement.statut_actuel.valeur) }
      ).addTo(this.map);

      const popupContent = this.createPopupContent(signalement);
      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('mouseover', () => {
        marker.openPopup();
      });

      marker.on('click', () => {
        this.onMarkerClick(signalement);
      });

      this.signalementMarkers.push(marker);
    });
  }

  private clearMarkers(): void {
    this.signalementMarkers.forEach(marker => marker.remove());
    this.signalementMarkers = [];
  }

  private getStatusIcon(statusValue: number): L.Icon {
    const iconMap: { [key: number]: string } = {
      1: 'red',      // Nouveau
      2: 'orange',   // En cours
      3: 'green',    // Terminé
    };
    
    const color = iconMap[statusValue] || 'blue';
    
    return L.icon({
      iconUrl: `assets/markers/marker-${color}.png`,
      shadowUrl: 'assets/markers/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  private createPopupContent(signalement: Signalement): string {
    const formatNumber = (num: number) => num.toLocaleString('fr-FR');
    const statusBadgeClass = this.getStatusBadgeClass(signalement.statut_actuel.valeur);

    return `
      <div class="signalement-popup">
        <div class="popup-header">
          <span class="popup-badge ${statusBadgeClass}">
            ${signalement.statut_actuel.nom}
          </span>
          <span class="popup-id">#${signalement.id}</span>
        </div>
        <div class="popup-body">
          <div class="popup-info">
            <span class="info-icon">📅</span>
            <span class="info-label">Date:</span>
            <span class="info-value">${signalement.date_creation}</span>
          </div>
          <div class="popup-info">
            <span class="info-icon">📏</span>
            <span class="info-label">Surface:</span>
            <span class="info-value">${formatNumber(signalement.surface)} m²</span>
          </div>
          <div class="popup-info">
            <span class="info-icon">💰</span>
            <span class="info-label">Budget:</span>
            <span class="info-value">${formatNumber(signalement.budget)} MGA</span>
          </div>
          <div class="popup-info">
            <span class="info-icon">🏢</span>
            <span class="info-label">Entreprise:</span>
            <span class="info-value">${signalement.entreprise.nom}</span>
          </div>
        </div>
      </div>
    `;
  }

  private getStatusBadgeClass(statusValue: number): string {
    const classMap: { [key: number]: string } = {
      1: 'badge-danger',   // Nouveau - rouge
      2: 'badge-warning',  // En cours - orange
      3: 'badge-success',  // Terminé - vert
      4: 'badge-secondary' // Annulé - gris
    };
    return classMap[statusValue] || 'badge-primary';
  }

  private onMarkerClick(signalement: Signalement): void {
    if (this.isManager) {
      this.selectedSignalement = signalement;
      this.newStatusId = signalement.statut_actuel.id;
      this.showStatusModal = true;
    }
  }

  public zoomIn(): void {
    this.map.zoomIn();
  }

  public zoomOut(): void {
    this.map.zoomOut();
  }

  public resetView(): void {
    this.map.setView(this.antananarivoCenter, this.defaultZoom);
  }

  public toggleRecap(): void {
    this.showRecapModal = !this.showRecapModal;
  }

  public closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedSignalement = null;
    this.newStatusId = null;
  }

  public updateStatus(): void {
    if (this.selectedSignalement && this.newStatusId) {
      this.mockDataService.updateSignalementStatut(
        this.selectedSignalement.id,
        this.newStatusId
      ).subscribe({
        next: (updated) => {
          console.log('Statut mis à jour:', updated);
          this.loadData();
          this.closeStatusModal();
        },
        error: (error) => {
          console.error('Erreur mise à jour statut:', error);
        }
      });
    }
  }

  public onSync(): void {
    console.log('Synchronisation lancée...');
    alert('Fonction de synchronisation à implémenter plus tard');
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.subscriptions.unsubscribe();
  }
}