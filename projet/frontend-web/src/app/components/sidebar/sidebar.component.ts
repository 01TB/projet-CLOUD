// src/app/components/sidebar/sidebar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MockDataService } from '../../services/mock-data.service';
import { StatutAvancement, Entreprise } from '../../models/signalement.model';

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
    dateDebut: '',
    dateFin: '',
    surfaceMin: null as number | null,
    surfaceMax: null as number | null,
    budgetMin: null as number | null,
    budgetMax: null as number | null
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadFilterOptions();
  }

  private loadFilterOptions(): void {
    this.mockDataService.getStatuts().subscribe(statuts => {
      this.statuts = statuts;
    });

    this.mockDataService.getEntreprises().subscribe(entreprises => {
      this.entreprises = entreprises;
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
      dateDebut: '',
      dateFin: '',
      surfaceMin: null,
      surfaceMax: null,
      budgetMin: null,
      budgetMax: null
    };
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChanged.emit(this.filters);
  }

  isStatutChecked(statutId: number): boolean {
    return this.filters.statuts.includes(statutId);
  }

  isEntrepriseChecked(entrepriseId: number): boolean {
    return this.filters.entreprises.includes(entrepriseId);
  }
}