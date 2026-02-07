// src/app/services/user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Utilisateur, Role } from '../models/signalement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;
  private rolesUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les utilisateurs avec leur statut de blocage
   */
  getAllUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl).pipe(
      map(users => users.map(user => this.enrichUserWithBlockStatus(user))),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`).pipe(
      map(user => this.enrichUserWithBlockStatus(user)),
      catchError(this.handleError)
    );
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(email: string, password: string, roleId: number): Observable<Utilisateur> {
    const body = {
      email: email,
      password: password,
      id_role: roleId
    };

    return this.http.post<Utilisateur>(this.apiUrl, body).pipe(
      map(user => this.enrichUserWithBlockStatus(user)),
      catchError(this.handleError)
    );
  }

  /**
   * Modifie le rôle d'un utilisateur
   */
  updateUserRole(userId: number, newRoleId: number): Observable<Utilisateur> {
    const body = {
      roleId: newRoleId
    };

    return this.http.put<Utilisateur>(`${this.apiUrl}/${userId}`, body).pipe(
      map(user => this.enrichUserWithBlockStatus(user)),
      catchError(this.handleError)
    );
  }

  // /**
  //  * Bloque un utilisateur
  //  */
  // blockUser(userId: number): Observable<Utilisateur> {
  //   return this.http.post<any>(`${this.apiUrl}/${userId}/bloquer`, {}).pipe(
  //     switchMap(() => this.getUserById(userId)),
  //     catchError(this.handleError)
  //   );
  // }

  // /**
  //  * Débloque un utilisateur
  //  */
  // unblockUser(userId: number): Observable<Utilisateur> {
  //   return this.http.delete<any>(`${this.apiUrl}/${userId}/bloquer`).pipe(
  //     switchMap(() => this.getUserById(userId)),
  //     catchError(this.handleError)
  //   );
  // }

  /**
   * Supprime un utilisateur
   */
  deleteUser(userId: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie si un utilisateur est bloqué
   */
  isUserBlocked(userId: number): Observable<boolean> {
    return this.http.get<{ estBloque: boolean }>(`${this.apiUrl}/${userId}/est-bloque`).pipe(
      map(response => response.estBloque),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère tous les rôles disponibles
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Calcule et retourne les statistiques des utilisateurs
   */
  getStatistics(): Observable<{
    total: number;
    managers: number;
    utilisateurs: number;
    visiteurs: number;
    bloques: number;
  }> {
    return this.getAllUsers().pipe(
      map(users => ({
        total: users.length,
        managers: users.filter(u => u.role.nom === 'MANAGER').length,
        utilisateurs: users.filter(u => u.role.nom === 'UTILISATEUR').length,
        visiteurs: users.filter(u => u.role.nom === 'VISITEUR').length,
        bloques: users.filter(u => u.est_bloque === true).length
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Enrichit un utilisateur avec son statut de blocage
   * (Le backend retourne les infos de blocage dans l'utilisateur)
   */
  private enrichUserWithBlockStatus(user: any): Utilisateur {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      date_creation: user.dateCreation || user.date_creation,
      est_bloque: user.estBloque || user.est_bloque || false,
      date_blocage: user.dateBlocage || user.date_blocage || null
    };
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('Erreur UserManagementService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}