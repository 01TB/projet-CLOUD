// src/app/components/map/map.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { SignalementService } from '../../services/signalement.service';
import { SyncService } from '../../services/sync.service';
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
  editForm: any = null;
  
  isManager = false;
  showRecapModal = false;

  constructor(
    private signalementService: SignalementService,
    private syncService: SyncService,
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
    const sigSub = this.signalementService.getAllSignalements().subscribe({
      next: (signalements) => {
        this.signalements = signalements;
        if (this.map) {
          this.addSignalementMarkers();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des signalements:', error);
      }
    });

    // TODO: Implémenter les endpoints pour les statistiques et statuts
    // Pour l'instant, on initialise avec des valeurs par défaut
    this.statistiques = {
      nb_signalements: 0,
      surface_totale: 0,
      budget_total: 0,
      avancement_pct: 0
    };

    this.statuts = [
      { id: 1, nom: 'NOUVEAU', valeur: 0 },
      { id: 2, nom: 'EN_COURS', valeur: 1 },
      { id: 3, nom: 'TERMINE', valeur: 2 }
    ];

    this.subscriptions.add(sigSub);
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
      0: 'red',      // Nouveau
      1: 'orange',   // En cours
      2: 'green',    // Terminé
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
      3: 'badge-success'   // Terminé - vert
    };
    return classMap[statusValue] || 'badge-primary';
  }

  private onMarkerClick(signalement: Signalement): void {
    if (this.isManager) {
      this.selectedSignalement = signalement;
      this.newStatusId = signalement.statut_actuel.id;
      
      // Initialiser le formulaire de modification avec les valeurs actuelles
      this.editForm = {
        dateCreation: signalement.date_creation,
        surface: signalement.surface,
        budget: signalement.budget,
        localisation: this.signalementService.locationToWkt(signalement.localisation),
        idUtilisateurCreateur: signalement.id_utilisateur_createur,
        idEntreprise: signalement.entreprise.id,
        synchro: false,
        idNouveauStatut: null // Pas de changement de statut par défaut
      };
      
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
    this.editForm = null;
  }

  public updateSignalement(): void {
    if (this.selectedSignalement && this.editForm) {
      // Validation basique
      if (!this.editForm.surface || this.editForm.surface <= 0) {
        alert('La surface doit être supérieure à 0');
        return;
      }
      if (!this.editForm.budget || this.editForm.budget <= 0) {
        alert('Le budget doit être supérieur à 0');
        return;
      }

      // Appeler l'API pour mettre à jour le signalement
      this.signalementService.updateSignalement(this.selectedSignalement.id, this.editForm).subscribe({
        next: (updatedSignalement) => {
          console.log('Signalement mis à jour avec succès:', updatedSignalement);
          
          // Afficher un message de confirmation
          if (this.editForm.idNouveauStatut && this.editForm.idNouveauStatut !== this.selectedSignalement?.statut_actuel.id) {
            alert('Signalement mis à jour et nouveau statut créé avec succès !');
          } else {
            alert('Signalement mis à jour avec succès !');
          }
          
          // Recharger les données pour afficher les changements
          this.closeStatusModal();
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du signalement:', error);
          alert('Erreur lors de la mise à jour du signalement. Veuillez réessayer.');
        }
      });
    }
  }

  public updateStatus(): void {
    // Cette méthode est maintenant obsolète, on utilise updateSignalement
    this.updateSignalement();
  }

  public onSync(): void {
    if (!this.isManager) {
      alert('Seuls les managers peuvent effectuer la synchronisation');
      return;
    }

    const confirmation = confirm(
      'Voulez-vous synchroniser les données avec Firebase?\n\n' +
      'Cela va :\n' +
      '- Envoyer les modifications locales vers Firebase (PUSH)\n' +
      '- Récupérer les nouvelles données depuis Firebase (PULL)\n' +
      '\nContinuer ?'
    );

    if (!confirmation) {
      return;
    }

    console.log('Synchronisation bidirectionnelle lancée...');
    
    // Afficher un indicateur de chargement (vous pouvez ajouter un spinner dans le HTML)
    const syncEntities = ['Signalement', 'StatutAvancement', 'AvancementSignalement'];
    
    this.syncService.synchronizeBidirectional(syncEntities, false).subscribe({
      next: (response) => {
        console.log('Synchronisation terminée:', response);
        
        if (response.success) {
          alert(
            '✅ Synchronisation réussie !\n\n' +
            response.message +
            (response.details ? '\n\nDétails:\n' + JSON.stringify(response.details, null, 2) : '')
          );
          
          // Recharger les signalements pour afficher les nouvelles données
          this.loadData();
        } else {
          alert(
            '❌ Erreur de synchronisation\n\n' +
            response.message +
            (response.errors && response.errors.length > 0 
              ? '\n\nErreurs:\n' + response.errors.join('\n') 
              : '')
          );
        }
      },
      error: (error) => {
        console.error('Erreur lors de la synchronisation:', error);
        alert(
          '❌ Erreur de synchronisation\n\n' +
          (error.error?.message || error.message || 'Erreur inconnue') +
          '\n\nVeuillez vérifier la connexion au serveur.'
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.subscriptions.unsubscribe();
  }
}