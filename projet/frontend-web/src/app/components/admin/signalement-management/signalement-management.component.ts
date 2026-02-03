// src/app/components/admin/signalement-management/signalement-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalementService } from '../../../services/signalement.service';
import { Signalement, StatutAvancement } from '../../../models/signalement.model';

@Component({
  selector: 'app-signalement-management',
  templateUrl: './signalement-management.component.html',
  styleUrls: ['./signalement-management.component.css']
})
export class SignalementManagementComponent implements OnInit, OnDestroy {
  signalements: Signalement[] = [];
  filteredSignalements: Signalement[] = [];
  
  // Filtres
  searchTerm = '';
  selectedStatutFilter = '';
  showSynchroOnly = false;
  
  // Statistiques
  stats = {
    total: 0,
    nouveaux: 0,
    enCours: 0,
    termines: 0,
    annules: 0
  };
  
  // Modals
  showDetailsModal = false;
  
  // Signalement sélectionné
  selectedSignalement: Signalement | null = null;
  
  // État
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  private subscriptions = new Subscription();

  constructor(private signalementService: SignalementService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    
    const signalementsSub = this.signalementService.getAllSignalements().subscribe({
      next: (signalements) => {
        this.signalements = signalements;
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des signalements');
        this.loading = false;
      }
    });

    this.subscriptions.add(signalementsSub);
  }

  calculateStats(): void {
    this.stats.total = this.signalements.length;
    this.stats.nouveaux = this.signalements.filter(s => s.statut_actuel.valeur === 0).length;
    this.stats.enCours = this.signalements.filter(s => s.statut_actuel.valeur === 1).length;
    this.stats.termines = this.signalements.filter(s => s.statut_actuel.valeur === 2).length;
    this.stats.annules = this.signalements.filter(s => s.statut_actuel.valeur === 3).length;
  }

  applyFilters(): void {
    let filtered = [...this.signalements];

    // Filtre par recherche (ID ou entreprise)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.id.toString().includes(term) ||
        (s.entreprise?.nom && s.entreprise.nom.toLowerCase().includes(term))
      );
    }

    // Filtre par statut
    if (this.selectedStatutFilter) {
      filtered = filtered.filter(s => s.statut_actuel.nom === this.selectedStatutFilter);
    }

    this.filteredSignalements = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatutFilter = '';
    this.showSynchroOnly = false;
    this.applyFilters();
  }

  // Affichage des détails
  openDetailsModal(signalement: Signalement): void {
    this.selectedSignalement = signalement;
    this.showDetailsModal = true;
    this.clearMessages();
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSignalement = null;
  }

  // Utilitaires
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
    return 'assets/img/login.png';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
