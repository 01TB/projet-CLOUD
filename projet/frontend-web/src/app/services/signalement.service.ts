// src/app/services/signalement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SignalementResponseDTO, Signalement, Localisation, StatutAvancement } from '../models/signalement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  private apiUrl = `${environment.apiUrl}/signalements`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les signalements
   */
  getAllSignalements(): Observable<Signalement[]> {
    return this.http.get<SignalementResponseDTO[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.convertDtoToSignalement(dto)))
    );
  }

  /**
   * Récupère un signalement par son ID
   */
  getSignalementById(id: number): Observable<Signalement> {
    return this.http.get<SignalementResponseDTO>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.convertDtoToSignalement(dto))
    );
  }

  /**
   * Récupère les signalements par entreprise
   */
  getSignalementsByEntreprise(entrepriseId: number): Observable<Signalement[]> {
    return this.http.get<SignalementResponseDTO[]>(`${this.apiUrl}/entreprise/${entrepriseId}`).pipe(
      map(dtos => dtos.map(dto => this.convertDtoToSignalement(dto)))
    );
  }

  /**
   * Récupère les signalements par utilisateur
   */
  getSignalementsByUtilisateur(utilisateurId: number): Observable<Signalement[]> {
    return this.http.get<SignalementResponseDTO[]>(`${this.apiUrl}/utilisateur/${utilisateurId}`).pipe(
      map(dtos => dtos.map(dto => this.convertDtoToSignalement(dto)))
    );
  }

  /**
   * Récupère les signalements par statut de synchronisation
   */
  getSignalementsBySynchro(synchro: boolean): Observable<Signalement[]> {
    return this.http.get<SignalementResponseDTO[]>(`${this.apiUrl}/synchro/${synchro}`).pipe(
      map(dtos => dtos.map(dto => this.convertDtoToSignalement(dto)))
    );
  }

  /**
   * Crée un nouveau signalement
   */
  createSignalement(signalement: any): Observable<Signalement> {
    return this.http.post<SignalementResponseDTO>(this.apiUrl, signalement).pipe(
      map(dto => this.convertDtoToSignalement(dto))
    );
  }

  /**
   * Met à jour un signalement
   */
  updateSignalement(id: number, signalement: any): Observable<Signalement> {
    return this.http.put<SignalementResponseDTO>(`${this.apiUrl}/${id}`, signalement).pipe(
      map(dto => this.convertDtoToSignalement(dto))
    );
  }

  /**
   * Supprime un signalement
   */
  deleteSignalement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Met à jour le statut de synchronisation
   */
  updateSynchroStatus(id: number, synchro: boolean): Observable<Signalement> {
    return this.http.patch<SignalementResponseDTO>(`${this.apiUrl}/${id}/synchro?synchro=${synchro}`, {}).pipe(
      map(dto => this.convertDtoToSignalement(dto))
    );
  }

  /**
   * Récupère les noms de photos d'un signalement
   */
  getSignalementPhotos(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/photos`);
  }

  /**
   * Ajoute un mouvement de prix forfaitaire m²
   * POST /api/signalements/prix
   */
  addMvtPrix(montant: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/prix`, montant);
  }

  /**
   * Convertit un SignalementResponseDTO en Signalement
   */
  private convertDtoToSignalement(dto: SignalementResponseDTO): Signalement {
    // Déterminer le statut actuel à partir du dernier avancement
    const statutActuel = this.getLastStatutFromAvancements(dto.avancements);
    
    return {
      id: dto.id,
      date_creation: dto.dateCreation,
      surface: dto.surface,
      budget: dto.budget,
      niveaux: dto.niveaux ?? undefined,
      localisation: this.parseWktToLocation(dto.localisation),
      entreprise: {
        id: dto.idEntreprise || 0,
        nom: dto.nomEntreprise || 'Non assigné'
      },
      statut_actuel: statutActuel,
      statut_affiche: statutActuel, // Initialiser avec le statut actuel, sera mis à jour par le filtre de date
      id_utilisateur_createur: dto.idUtilisateurCreateur,
      email_utilisateur_createur: dto.emailUtilisateurCreateur,
      avancements: dto.avancements // Conserver la liste des avancements pour filtrage par date
    };
  }

  /**
   * Extrait le statut actuel du dernier avancement (le plus récent)
   * La liste est déjà triée par date décroissante depuis le backend
   */
  private getLastStatutFromAvancements(avancements: any[]): StatutAvancement {
    if (avancements && avancements.length > 0) {
      const dernierAvancement = avancements[0]; // Le premier est le plus récent
      return {
        id: dernierAvancement.idStatutAvancement,
        nom: dernierAvancement.nomStatutAvancement,
        valeur: dernierAvancement.valeurStatutAvancement
      };
    }
    
    // Statut par défaut si aucun avancement
    return {
      id: 1,
      nom: 'Nouveau',
      valeur: 1
    };
  }

  /**
   * Parse une chaîne WKT (Well-Known Text) en objet Localisation
   * Exemple: "POINT (47.5236 -18.8792)" ou "POINT(47.5236 -18.8792)" => { lng: 47.5236, lat: -18.8792 }
   */
  private parseWktToLocation(wkt: string): Localisation {
    try {
      // Extrait les coordonnées du format POINT(lng lat) ou POINT (lng lat)
      // \s* permet un espace optionnel après POINT
      const match = wkt.match(/POINT\s*\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
      if (match) {
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        console.log(`WKT parsé: "${wkt}" => lng: ${lng}, lat: ${lat}`);
        return { lng, lat };
      } else {
        console.warn(`Échec du parsing WKT: "${wkt}" - utilisation de la position par défaut`);
      }
    } catch (error) {
      console.error('Erreur lors du parsing WKT:', wkt, error);
    }
    
    // Valeur par défaut (centre d'Antananarivo)
    console.warn('Utilisation de la position par défaut pour:', wkt);
    return { lng: 47.5236, lat: -18.8792 };
  }

  /**
   * Convertit une Localisation en format WKT
   * Exemple: { lng: 47.5236, lat: -18.8792 } => "POINT(47.5236 -18.8792)"
   */
  public locationToWkt(location: Localisation): string {
    return `POINT(${location.lng} ${location.lat})`;
  }
}
