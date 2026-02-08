// src/app/services/filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Signalement } from '../models/signalement.model';

export interface SignalementFilters {
  statuts: number[];
  entreprises: number[];
  date: string; // Date unique pour filtrer les signalements par leur statut à cette date
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
    date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
    surfaceMin: null,
    surfaceMax: null,
    budgetMin: null,
    budgetMax: null
  });

  public filters$ = this.filtersSubject.asObservable();

  updateFilters(filters: SignalementFilters): void {
    // console.log('UpdateFilters appelé avec:', filters);
    // console.log('Statuts reçus:', filters.statuts, 'Type:', typeof filters.statuts, 'Length:', filters.statuts.length);
    this.filtersSubject.next(filters);
  }

  applyFilters(signalements: Signalement[], filters: SignalementFilters): Signalement[] {
    // D'abord, mettre à jour le statut_affiche de TOUS les signalements selon la date
    signalements.forEach(signalement => {
      signalement.statut_affiche = this.getStatutAtDate(signalement, filters.date);
    });
    
    const filtered = signalements.filter(signalement => {
      // Utiliser le statut déjà calculé
      const statutALaDate = signalement.statut_affiche!;
      
      // console.log(`\n--- Traitement Signalement #${signalement.id} ---`);
      // console.log('Statut à la date:', statutALaDate);
      // console.log('filters.statuts.length:', filters.statuts.length);
      
      // Filtre par statut (basé sur le statut à la date sélectionnée)
      // S'assurer que les IDs sont comparés en tant que nombres
      if (filters.statuts.length > 0) {
        const statutIdNumber = Number(statutALaDate.id);
        const included = filters.statuts.includes(statutIdNumber);
        // console.log('Filtre statut actif - ID:', statutIdNumber, 'dans', filters.statuts, '→', included);
        if (!included) {
          // console.log('❌ FILTRÉ : statut non inclus');
          return false;
        }
      } 

      // Filtre par entreprise
      if (filters.entreprises.length > 0 && !filters.entreprises.includes(signalement.entreprise.id)) {
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
    
    return filtered;
  }

  /**
   * Récupère le statut d'un signalement à une date donnée
   * en prenant le dernier avancement avant ou égal à cette date
   */
  private getStatutAtDate(signalement: Signalement, dateStr: string): any {
    if (!signalement.avancements || signalement.avancements.length === 0) {
      // Si pas d'avancements, retourner le statut actuel
      return signalement.statut_actuel;
    }

    // Convertir la date de filtre en timestamp pour comparaison
    const dateFiltre = new Date(dateStr + 'T23:59:59').getTime();

    // Trouver le dernier avancement avant ou égal à la date sélectionnée
    // Les avancements sont triés par date décroissante depuis le backend
    let dernierAvancement = null;
    for (const avancement of signalement.avancements) {
      const dateAvancement = new Date(avancement.dateModification).getTime();
      if (dateAvancement <= dateFiltre) {
        dernierAvancement = avancement;
        break;
      }
    }

    // Si aucun avancement trouvé avant cette date, utiliser le statut par défaut
    if (!dernierAvancement) {
      return {
        id: 1,
        nom: 'Nouveau',
        valeur: 1
      };
    }
    
    return {
      id: dernierAvancement.idStatutAvancement,
      nom: dernierAvancement.nomStatutAvancement,
      valeur: dernierAvancement.valeurStatutAvancement
    };
  }
}
