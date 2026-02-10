// src/app/components/signalement-detail/signalement-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalementService } from '../../services/signalement.service';
import { AuthService } from '../../services/auth.service';
import { Signalement, StatutAvancement } from '../../models/signalement.model';
import photoData from '../../../assets/img/login_image_data.json';

@Component({
  selector: 'app-signalement-detail',
  templateUrl: './signalement-detail.component.html',
  styleUrls: ['./signalement-detail.component.css']
})
export class SignalementDetailComponent implements OnInit, OnDestroy {
  signalement: Signalement | null = null;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  editForm: any = null;
  statuts: StatutAvancement[] = [];
  canEdit = false;
  photoNames: string[] = [];
  imageBaseUrl = '/api/images/';
  
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalementService: SignalementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.authService.canCreateSignalement();
    
    // Initialiser les statuts
    this.statuts = [
      { id: 1, nom: 'NOUVEAU', valeur: 0 },
      { id: 2, nom: 'EN_COURS', valeur: 1 },
      { id: 3, nom: 'TERMINE', valeur: 2 }
    ];
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSignalement(parseInt(id, 10));
    } else {
      this.errorMessage = 'ID du signalement manquant';
    }
  }

  private loadSignalement(id: number): void {
    this.loading = true;
    
    const sub = this.signalementService.getSignalementById(id).subscribe({
      next: (signalement) => {
        this.signalement = signalement;
        this.loading = false;
        // Charger les photos du signalement
        this.loadPhotos(id);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du signalement';
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  private loadPhotos(id: number): void {
    const photoSub = this.signalementService.getSignalementPhotos(id).subscribe({
      next: (photoNames) => {
        this.photoNames = photoNames;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des photos:', error);
        this.photoNames = [];
      }
    });

    this.subscriptions.add(photoSub);
  }

  getStatutBadgeClass(statutNom: string): string {
    const classes: { [key: string]: string } = {
      'Nouveau': 'badge-nouveau',
      'En cours': 'badge-encours',
      'Terminé': 'badge-termine',
      'Annulé': 'badge-annule'
    };
    return classes[statutNom] || 'badge-default';
  }

  getStatutIcon(statutNom: string): string {
    const icons: { [key: string]: string } = {
      'Nouveau': '🆕',
      'En cours': '🚧',
      'Terminé': '✅',
      'Annulé': '❌'
    };
    return icons[statutNom] || '📋';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  formatBudget(budget: number): string {
    return new Intl.NumberFormat('fr-FR').format(budget) + ' MGA';
  }

  formatSurface(surface: number): string {
    return surface.toFixed(2) + ' m²';
  }

  getDefaultPhoto(): string {
    return photoData.photo;
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }

  enableEditMode(): void {
    if (!this.signalement || !this.canEdit) return;
    
    this.editForm = {
      dateCreation: this.signalement.date_creation,
      surface: this.signalement.surface,
      budget: this.signalement.budget,
      niveaux: this.signalement.niveaux,
      localisation: this.signalementService.locationToWkt(this.signalement.localisation),
      idUtilisateurCreateur: this.signalement.id_utilisateur_createur,
      idEntreprise: this.signalement.entreprise.id,
      synchro: false,
      idNouveauStatut: null,
      dateModificationStatut: new Date().toISOString().slice(0, 16)
    };
    
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editForm = null;
  }

  saveChanges(): void {
    if (!this.signalement || !this.editForm) return;

    // Validation
    if (!this.editForm.surface || this.editForm.surface <= 0) {
      alert('La surface doit être supérieure à 0');
      return;
    }
    if (!this.editForm.budget || this.editForm.budget <= 0) {
      alert('Le budget doit être supérieur à 0');
      return;
    }

    const dataToSend = {
      ...this.editForm,
      dateModificationStatut: this.editForm.dateModificationStatut ? 
        this.editForm.dateModificationStatut + ':00' : undefined
    };

    this.loading = true;
    this.signalementService.updateSignalement(this.signalement.id, dataToSend).subscribe({
      next: (updatedSignalement) => {
        if (this.editForm.idNouveauStatut && this.editForm.idNouveauStatut !== this.signalement?.statut_actuel.id) {
          alert('Signalement mis à jour et nouveau statut créé avec succès !');
        } else {
          alert('Signalement mis à jour avec succès !');
        }
        
        this.isEditMode = false;
        this.editForm = null;
        this.loadSignalement(this.signalement!.id);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour. Veuillez réessayer.');
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
