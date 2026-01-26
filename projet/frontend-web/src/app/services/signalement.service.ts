import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Signalement, AvancementSignalement } from '../models/signalement.model';
import { StatutAvancement } from '../models/statut-avancement.model';

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  private signalements: Signalement[] = [
    {
      id: 1,
      date_creation: '2024-01-15',
      surface: 50.5,
      budget: 5000,
      localisation: { lat: -18.8792, lng: 47.5236 },
      synchro: true,
      id_utilisateur_createur: 1,
      id_entreprise: 1,
      statut_actuel: { id: 1, nom: 'Nouveau', valeur: 1, synchro: true },
      photos: ['assets/signalements/signalement1.jpg']
    }
  ];

  private statuts: StatutAvancement[] = [
    { id: 1, nom: 'Nouveau', valeur: 1, synchro: true },
    { id: 2, nom: 'En cours', valeur: 2, synchro: true },
    { id: 3, nom: 'Terminé', valeur: 3, synchro: true },
    { id: 4, nom: 'Annulé', valeur: 4, synchro: true }
  ];

  getSignalements(filters?: any): Observable<Signalement[]> {
    // TODO: Intégrer avec l'API Spring Boot
    return of(this.signalements);
  }

  getSignalementById(id: number): Observable<Signalement> {
    const signalement = this.signalements.find(s => s.id === id);
    return of(signalement || this.signalements[0]);
  }

  createSignalement(signalement: Signalement): Observable<Signalement> {
    // TODO: Intégrer avec l'API Spring Boot
    const newId = Math.max(...this.signalements.map(s => s.id)) + 1;
    signalement.id = newId;
    this.signalements.push(signalement);
    return of(signalement);
  }

  updateSignalementStatus(id: number, statutId: number): Observable<boolean> {
    // TODO: Intégrer avec l'API Spring Boot
    const signalement = this.signalements.find(s => s.id === id);
    if (signalement) {
      const statut = this.statuts.find(s => s.id === statutId);
      if (statut) {
        signalement.statut_actuel = statut;
      }
    }
    return of(true);
  }

  getStatutsAvancement(): Observable<StatutAvancement[]> {
    return of(this.statuts);
  }

  exportToExcel(): Observable<Blob> {
    // TODO: Implémenter l'export Excel
    return of(new Blob());
  }

  exportToPDF(): Observable<Blob> {
    // TODO: Implémenter l'export PDF
    return of(new Blob());
  }
}