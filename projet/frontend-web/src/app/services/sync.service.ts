// src/app/services/sync.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SyncResponse {
  success: boolean;
  message: string;
  details?: {
    entityType?: string;
    pushed?: number;
    pulled?: number;
    conflicts?: number;
  };
  errors?: string[];
}

export interface SyncRequest {
  entityTypes: string[];
  direction: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
  forceSync?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private apiUrl = `${environment.apiUrl}/sync`;

  constructor(private http: HttpClient) {}

  /**
   * Synchronisation bidirectionnelle (par défaut tous les types d'entités)
   */
  synchronizeBidirectional(entities?: string, forceSync: boolean = false): Observable<SyncResponse> {
    const params = new HttpParams()
      .set('forceSync', false)
      .set('entities', '');

    return this.http.post<SyncResponse>(`${this.apiUrl}/bidirectional`, null, { params });
  }

  /**
   * Synchronisation push (envoyer vers Firebase)
   */
  push(entities?: string, forceSync: boolean = false): Observable<SyncResponse> {
    const params = new HttpParams()
      .set('forceSync', false)
      .set('entities', '');

    return this.http.post<SyncResponse>(`${this.apiUrl}/push`, null, { params });
  }

  /**
   * Synchronisation pull (récupérer depuis Firebase)
   */
  pull(entities?: string): Observable<SyncResponse> {
    const params = entities?.length 
      ? new HttpParams().set('entities', '')
      : new HttpParams();

    return this.http.post<SyncResponse>(`${this.apiUrl}/pull`, null, { params });
  }

  /**
   * Synchronisation personnalisée
   */
  synchronize(request: SyncRequest): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(this.apiUrl, request);
  }

  /**
   * Obtenir le statut de synchronisation d'une entité
   */
  getSyncStatus(entityType: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${entityType}`);
  }

  /**
   * Obtenir la liste des entités supportées
   */
  getSupportedEntities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/supported-entities`);
  }

  /**
   * Health check du service de synchronisation
   */
  health(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
