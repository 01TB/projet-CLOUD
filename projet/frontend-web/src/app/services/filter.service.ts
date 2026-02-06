// src/app/services/filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Signalement } from '../models/signalement.model';

export interface SignalementFilters {
  statuts: number[];
  entreprises: number[];
  dateDebut: string;
  dateFin: string;
  surfaceMin: number | null;
  surfaceMax: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filtersSubject = new BehaviorSubject<SignalementFilters>({
    statuts: [],
    entreprises: [],
    dateDebut: '',
    dateFin: '',
    surfaceMin: null,
    surfaceMax: null,
    budgetMin: null,
    budgetMax: null
  });

  public filters$ = this.filtersSubject.asObservable();

  updateFilters(filters: SignalementFilters): void {
    this.filtersSubject.next(filters);
  }

  applyFilters(signalements: Signalement[], filters: SignalementFilters): Signalement[] {
    return signalements.filter(signalement => {
      // Filtre par statut
      if (filters.statuts.length > 0 && !filters.statuts.includes(signalement.statut_actuel.id)) {
        return false;
      }

      // Filtre par entreprise
      if (filters.entreprises.length > 0 && !filters.entreprises.includes(signalement.entreprise.id)) {
        return false;
      }

      // Filtre par date début
      if (filters.dateDebut && signalement.date_creation < filters.dateDebut) {
        return false;
      }

      // Filtre par date fin
      if (filters.dateFin && signalement.date_creation > filters.dateFin) {
        return false;
      }

      // Filtre par surface min
      if (filters.surfaceMin !== null && signalement.surface < filters.surfaceMin) {
        return false;
      }

      // Filtre par surface max
      if (filters.surfaceMax !== null && signalement.surface > filters.surfaceMax) {
        return false;
      }

      // Filtre par budget min
      if (filters.budgetMin !== null && signalement.budget < filters.budgetMin) {
        return false;
      }

      // Filtre par budget max
      if (filters.budgetMax !== null && signalement.budget > filters.budgetMax) {
        return false;
      }

      return true;
    });
  }
}
