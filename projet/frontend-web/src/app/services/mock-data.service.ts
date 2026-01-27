// src/app/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Signalement, StatistiquesRecap, StatutAvancement, Entreprise } from '../models/signalement.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private statuts: StatutAvancement[] = [
    { id: 1, nom: 'Nouveau', valeur: 1 },
    { id: 2, nom: 'En cours', valeur: 2 },
    { id: 3, nom: 'Terminé', valeur: 3 },
    { id: 4, nom: 'Annulé', valeur: 4 }
  ];

  private entreprises: Entreprise[] = [
    { id: 1, nom: 'SECREN Madagascar' },
    { id: 2, nom: 'Colas Madagascar' },
    { id: 3, nom: 'Razel-Bec' },
    { id: 4, nom: 'SOGEA SATOM' },
    { id: 5, nom: 'TSIMIRORO' }
  ];

  private signalements: Signalement[] = [
    {
      id: 1,
      date_creation: '2024-01-15',
      surface: 45.5,
      budget: 15000000,
      localisation: { lat: -18.8792, lng: 47.5236 },
      entreprise: this.entreprises[0],
      statut_actuel: this.statuts[2], // Terminé
      id_utilisateur_createur: 1
    },
    {
      id: 2,
      date_creation: '2024-01-18',
      surface: 78.3,
      budget: 25000000,
      localisation: { lat: -18.8850, lng: 47.5180 },
      entreprise: this.entreprises[1],
      statut_actuel: this.statuts[1], // En cours
      id_utilisateur_createur: 1
    },
    {
      id: 3,
      date_creation: '2024-01-20',
      surface: 120.0,
      budget: 38000000,
      localisation: { lat: -18.8700, lng: 47.5300 },
      entreprise: this.entreprises[2],
      statut_actuel: this.statuts[0], // Nouveau
      id_utilisateur_createur: 2
    },
    {
      id: 4,
      date_creation: '2024-01-22',
      surface: 56.7,
      budget: 18500000,
      localisation: { lat: -18.8920, lng: 47.5150 },
      entreprise: this.entreprises[3],
      statut_actuel: this.statuts[1], // En cours
      id_utilisateur_createur: 1
    },
    {
      id: 5,
      date_creation: '2024-01-25',
      surface: 92.4,
      budget: 29000000,
      localisation: { lat: -18.8650, lng: 47.5400 },
      entreprise: this.entreprises[0],
      statut_actuel: this.statuts[2], // Terminé
      id_utilisateur_createur: 2
    },
    {
      id: 6,
      date_creation: '2024-01-26',
      surface: 65.8,
      budget: 21000000,
      localisation: { lat: -18.8800, lng: 47.5100 },
      entreprise: this.entreprises[4],
      statut_actuel: this.statuts[0], // Nouveau
      id_utilisateur_createur: 1
    },
    {
      id: 7,
      date_creation: '2024-01-27',
      surface: 110.5,
      budget: 35000000,
      localisation: { lat: -18.8750, lng: 47.5280 },
      entreprise: this.entreprises[1],
      statut_actuel: this.statuts[1], // En cours
      id_utilisateur_createur: 2
    },
    {
      id: 8,
      date_creation: '2024-01-28',
      surface: 43.2,
      budget: 14000000,
      localisation: { lat: -18.8880, lng: 47.5200 },
      entreprise: this.entreprises[2],
      statut_actuel: this.statuts[0], // Nouveau
      id_utilisateur_createur: 1
    }
  ];

  constructor() {}

  getSignalements(): Observable<Signalement[]> {
    return of(this.signalements);
  }

  getStatuts(): Observable<StatutAvancement[]> {
    return of(this.statuts);
  }

  getEntreprises(): Observable<Entreprise[]> {
    return of(this.entreprises);
  }

  getStatistiques(): Observable<StatistiquesRecap> {
    const nbSignalements = this.signalements.length;
    const surfaceTotale = this.signalements.reduce((sum, s) => sum + s.surface, 0);
    const budgetTotal = this.signalements.reduce((sum, s) => sum + s.budget, 0);
    
    // Calcul de l'avancement basé sur les statuts
    const nbTermines = this.signalements.filter(s => s.statut_actuel.valeur === 3).length;
    const nbEnCours = this.signalements.filter(s => s.statut_actuel.valeur === 2).length;
    const avancementPct = Math.round(
      ((nbTermines + (nbEnCours * 0.5)) / nbSignalements) * 100
    );

    return of({
      nb_signalements: nbSignalements,
      surface_totale: surfaceTotale,
      budget_total: budgetTotal,
      avancement_pct: avancementPct
    });
  }

  updateSignalementStatut(signalementId: number, nouveauStatutId: number): Observable<Signalement> {
    const signalement = this.signalements.find(s => s.id === signalementId);
    if (signalement) {
      const nouveauStatut = this.statuts.find(st => st.id === nouveauStatutId);
      if (nouveauStatut) {
        signalement.statut_actuel = nouveauStatut;
      }
    }
    return of(signalement!);
  }

  addSignalement(signalement: Omit<Signalement, 'id'>): Observable<Signalement> {
    const newId = Math.max(...this.signalements.map(s => s.id)) + 1;
    const newSignalement = { ...signalement, id: newId } as Signalement;
    this.signalements.push(newSignalement);
    return of(newSignalement);
  }
}