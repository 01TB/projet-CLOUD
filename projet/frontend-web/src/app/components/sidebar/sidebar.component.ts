// src/app/components/sidebar/sidebar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StatutAvancement, Entreprise } from '../../models/signalement.model';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();

  statuts: StatutAvancement[] = [];
  entreprises: Entreprise[] = [];

  filters = {
    statuts: [] as number[],
    entreprises: [] as number[],
    date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut (format YYYY-MM-DD)
    surfaceMin: null as number | null,
    surfaceMax: null as number | null,
    budgetMin: null as number | null,
    budgetMax: null as number | null
  };

  constructor(
    private http: HttpClient,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    // Émettre les filtres initiaux (avec la date d'aujourd'hui)
    this.emitFilters();
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

  onStatutChange(statutId: number, event: any): void {
    if (event.target.checked) {
      this.filters.statuts.push(statutId);
    } else {
      this.filters.statuts = this.filters.statuts.filter(id => id !== statutId);
    }
    this.emitFilters();
  }

  onEntrepriseChange(entrepriseId: number, event: any): void {
    if (event.target.checked) {
      this.filters.entreprises.push(entrepriseId);
    } else {
      this.filters.entreprises = this.filters.entreprises.filter(id => id !== entrepriseId);
    }
    this.emitFilters();
  }

  onFilterChange(): void {
    this.emitFilters();
  }

  resetFilters(): void {
    this.filters = {
      statuts: [],
      entreprises: [],
      date: new Date().toISOString().split('T')[0], // Réinitialiser à aujourd'hui
      surfaceMin: null,
      surfaceMax: null,
      budgetMin: null,
      budgetMax: null
    };
    this.emitFilters();
  }

  private emitFilters(): void {
    // Créer une copie de l'objet filters pour éviter les problèmes de référence
    const filtersCopy = {
      statuts: [...this.filters.statuts],
      entreprises: [...this.filters.entreprises],
      date: this.filters.date,
      surfaceMin: this.filters.surfaceMin,
      surfaceMax: this.filters.surfaceMax,
      budgetMin: this.filters.budgetMin,
      budgetMax: this.filters.budgetMax
    };
    this.filtersChanged.emit(filtersCopy);
    this.filterService.updateFilters(filtersCopy);
  }

  isStatutChecked(statutId: number): boolean {
    return this.filters.statuts.includes(statutId);
  }

  isEntrepriseChecked(entrepriseId: number): boolean {
    return this.filters.entreprises.includes(entrepriseId);
  }
}