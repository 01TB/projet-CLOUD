import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncLogs: any[] = [
    { id: 1, date: '2024-01-27 10:30:00', type: 'Automatique', status: 'Réussi', items: 15 },
    { id: 2, date: '2024-01-26 18:45:00', type: 'Manuelle', status: 'Réussi', items: 8 }
  ];

  syncNow(options: { type: 'all' | 'new', dataTypes: string[] }): Observable<boolean> {
    console.log('Synchronisation avec options:', options);
    // TODO: Intégrer avec l'API Spring Boot
    return of(true);
  }

  getSyncLogs(): Observable<any[]> {
    return of(this.syncLogs);
  }

  getSyncStats(): Observable<{ pending: number, synced: number, failed: number }> {
    return of({ pending: 3, synced: 150, failed: 2 });
  }
}