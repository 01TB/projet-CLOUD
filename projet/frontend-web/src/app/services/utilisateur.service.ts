import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private utilisateurs: Utilisateur[] = [
    {
      id: 1,
      email: 'admin@example.com',
      password: '',
      synchro: true,
      id_role: 1,
      role: { id: 1, nom: 'Administrateur', synchro: true }
    },
    {
      id: 2,
      email: 'technicien@example.com',
      password: '',
      synchro: true,
      id_role: 2,
      role: { id: 2, nom: 'Technicien', synchro: true },
      bloque: false
    }
  ];

  getUtilisateurs(): Observable<Utilisateur[]> {
    return of(this.utilisateurs);
  }

  toggleBlockUser(userId: number, block: boolean): Observable<boolean> {
    const user = this.utilisateurs.find(u => u.id === userId);
    if (user) {
      user.bloque = block;
      user.date_blocage = block ? new Date() : undefined;
    }
    return of(true);
  }

  updateUserProfile(userId: number, data: any): Observable<boolean> {
    // TODO: Intégrer avec l'API Spring Boot
    return of(true);
  }
}