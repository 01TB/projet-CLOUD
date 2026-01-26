import { Component, Output, EventEmitter } from '@angular/core';
import { SignalementService } from '../../services/signalement.service';
import { StatutAvancement } from '../../models/statut-avancement.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() filtersChanged = new EventEmitter<any>();
  
  statuts: StatutAvancement[] = [];
  selectedStatut: number | null = null;
  dateDebut: string = '';
  dateFin: string = '';
  showOnlyMine = false;

  constructor(private signalementService: SignalementService) {
    this.signalementService.getStatutsAvancement().subscribe(statuts => {
      this.statuts = statuts;
    });
  }

  applyFilters() {
    const filters = {
      statut: this.selectedStatut,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin,
      showOnlyMine: this.showOnlyMine
    };
    this.filtersChanged.emit(filters);
  }

  resetFilters() {
    this.selectedStatut = null;
    this.dateDebut = '';
    this.dateFin = '';
    this.showOnlyMine = false;
    this.applyFilters();
  }
}