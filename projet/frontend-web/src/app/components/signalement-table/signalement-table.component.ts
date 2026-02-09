// src/app/components/signalement-table/signalement-table.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SignalementService } from '../../services/signalement.service';
import { Signalement, StatutAvancement, Entreprise } from '../../models/signalement.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-signalement-table',
  templateUrl: './signalement-table.component.html',
  styleUrls: ['./signalement-table.component.css']
})
export class SignalementTableComponent implements OnInit, OnDestroy {
  signalements: Signalement[] = [];
  filteredSignalements: Signalement[] = [];
  
  // Données pour les filtres
  statuts: StatutAvancement[] = [];
  entreprises: Entreprise[] = [];
  
  // Filtres
  filters = {
    date: new Date().toISOString().split('T')[0],
    statuts: [] as number[],
    entreprises: [] as number[],
    searchTerm: ''
  };
  
  // Statistiques dynamiques
  stats = {
    total: 0,
    nouveaux: 0,
    enCours: 0,
    termines: 0,
    surfaceTotale: 0,
    budgetTotal: 0,
    avancementPct: 0
  };
  
  loading = false;
  
  private subscriptions = new Subscription();

  constructor(
    private signalementService: SignalementService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadSignalements();
  }

  private loadFilterOptions(): void {
    this.http.get<StatutAvancement[]>(`${environment.apiUrl}/statutAvancements`).subscribe({
      next: statuts => this.statuts = statuts,
      error: err => console.error('Erreur récupération statuts', err)
    });

    this.http.get<Entreprise[]>(`${environment.apiUrl}/entreprises`).subscribe({
      next: entreprises => this.entreprises = entreprises,
      error: err => console.error('Erreur récupération entreprises', err)
    });
  }

  private loadSignalements(): void {
    this.loading = true;
    
    const sub = this.signalementService.getAllSignalements().subscribe({
      next: (signalements) => {
        this.signalements = signalements;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des signalements:', error);
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    let filtered = [...this.signalements];

    // Calculer le statut à la date sélectionnée pour chaque signalement
    filtered.forEach(s => {
      s.statut_affiche = this.getStatutAtDate(s, this.filters.date);
    });

    // Filtre par date de création (ne garder que les signalements créés avant ou à la date)
    const dateFiltre = new Date(this.filters.date + 'T23:59:59').getTime();
    filtered = filtered.filter(s => {
      const dateCreation = new Date(s.date_creation).getTime();
      return dateCreation <= dateFiltre;
    });

    // Filtre par statut (à la date sélectionnée)
    if (this.filters.statuts.length > 0) {
      filtered = filtered.filter(s => 
        this.filters.statuts.includes(s.statut_affiche!.id)
      );
    }

    // Filtre par entreprise
    if (this.filters.entreprises.length > 0) {
      filtered = filtered.filter(s => 
        this.filters.entreprises.includes(s.entreprise.id)
      );
    }

    // Filtre par recherche (ID ou entreprise)
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.id.toString().includes(term) ||
        (s.entreprise?.nom && s.entreprise.nom.toLowerCase().includes(term))
      );
    }

    this.filteredSignalements = filtered;
    this.calculateStats();
  }

  private getStatutAtDate(signalement: Signalement, dateStr: string): StatutAvancement {
    // Récupérer les avancements du signalement via le DTO original
    const avancements = (signalement as any).avancements || [];
    
    if (!avancements || avancements.length === 0) {
      return signalement.statut_actuel;
    }

    const targetDate = new Date(dateStr + 'T23:59:59').getTime();
    
    // Trier par date décroissante et trouver le premier avancement <= targetDate
    const avancementsAvantDate = avancements
      .filter((av: any) => new Date(av.dateAvancement).getTime() <= targetDate)
      .sort((a: any, b: any) => new Date(b.dateAvancement).getTime() - new Date(a.dateAvancement).getTime());
    
    if (avancementsAvantDate.length > 0) {
      const av = avancementsAvantDate[0];
      return {
        id: av.idStatutAvancement,
        nom: av.nomStatutAvancement,
        valeur: av.valeurStatutAvancement
      };
    }
    
    return signalement.statut_actuel;
  }

  private calculateStats(): void {
    const data = this.filteredSignalements;
    
    this.stats.total = data.length;
    this.stats.nouveaux = data.filter(s => s.statut_affiche?.valeur === 0 || s.statut_actuel.valeur === 0).length;
    this.stats.enCours = data.filter(s => s.statut_affiche?.valeur === 1 || s.statut_actuel.valeur === 1).length;
    this.stats.termines = data.filter(s => s.statut_affiche?.valeur === 2 || s.statut_actuel.valeur === 2).length;
    this.stats.surfaceTotale = data.reduce((acc, s) => acc + (s.surface || 0), 0);
    this.stats.budgetTotal = data.reduce((acc, s) => acc + (s.budget || 0), 0);
    
    // Calcul du pourcentage d'avancement
    if (data.length > 0) {
      const maxStatVal = this.statuts.length > 0 ? Math.max(...this.statuts.map(st => st.valeur)) : 2;
      const totalPct = data.reduce((acc, s) => {
        const val = s.statut_affiche?.valeur ?? s.statut_actuel.valeur;
        return acc + (val / maxStatVal) * 100;
      }, 0);
      this.stats.avancementPct = Math.round(totalPct / data.length);
    } else {
      this.stats.avancementPct = 0;
    }
  }

  toggleStatut(statutId: number): void {
    const index = this.filters.statuts.indexOf(statutId);
    if (index > -1) {
      this.filters.statuts.splice(index, 1);
    } else {
      this.filters.statuts.push(statutId);
    }
    this.applyFilters();
  }

  toggleEntreprise(entrepriseId: number): void {
    const index = this.filters.entreprises.indexOf(entrepriseId);
    if (index > -1) {
      this.filters.entreprises.splice(index, 1);
    } else {
      this.filters.entreprises.push(entrepriseId);
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      date: new Date().toISOString().split('T')[0],
      statuts: [],
      entreprises: [],
      searchTerm: ''
    };
    this.applyFilters();
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatBudget(budget: number): string {
    return new Intl.NumberFormat('fr-FR').format(budget) + ' MGA';
  }

  formatSurface(surface: number): string {
    return surface.toFixed(2) + ' m²';
  }

  getStatutBadgeClass(statut: StatutAvancement): string {
    const classes: { [key: number]: string } = {
      0: 'badge-nouveau',
      1: 'badge-encours',
      2: 'badge-termine'
    };
    return classes[statut.valeur] || 'badge-default';
  }

  getStatutIcon(valeur: number): string {
    const icons: { [key: number]: string } = {
      0: '🆕',
      1: '🚧',
      2: '✅'
    };
    return icons[valeur] || '📋';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
