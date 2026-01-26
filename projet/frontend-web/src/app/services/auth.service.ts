import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Simuler un utilisateur connecté pour le développement
    const mockUser: Utilisateur = {
      id: 1,
      email: 'admin@example.com',
      password: '',
      synchro: true,
      id_role: 1,
      role: { id: 1, nom: 'Administrateur', synchro: true }
    };
    this.currentUserSubject.next(mockUser);
    this.isAuthenticatedSubject.next(true);
  }

  login(email: string, password: string): Observable<boolean> {
    // TODO: Intégrer avec l'API Spring Boot
    return of(true);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  register(userData: any): Observable<boolean> {
    // TODO: Intégrer avec l'API Spring Boot
    return of(true);
  }

  getCurrentUser(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.nom === 'Administrateur';
  }
}