// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utilisateur, Role } from '../models/signalement.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Utilisateur | null>;
  public currentUser$: Observable<Utilisateur | null>;

  private roles: Role[] = [
    { id: 1, nom: 'Manager' },
    { id: 2, nom: 'Utilisateur' },
    { id: 3, nom: 'Visiteur' }
  ];

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<Utilisateur | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated$(): Observable<boolean> {
    return new BehaviorSubject<boolean>(this.currentUserSubject.value !== null).asObservable();
  }

  public isManager(): boolean {
    return this.currentUserValue?.role?.nom === 'Manager';
  }

  public isUser(): boolean {
    return this.currentUserValue?.role?.nom === 'Utilisateur';
  }

  public isVisitor(): boolean {
    return this.currentUserValue?.role?.nom === 'Visiteur';
  }

  public canCreateSignalement(): boolean {
    return this.isManager() || this.isUser();
  }

  // Connexion simulée
  login(email: string, roleType: 'Manager' | 'Utilisateur' | 'Visiteur'): Observable<Utilisateur> {
    const role = this.roles.find(r => r.nom === roleType)!;
    const user: Utilisateur = {
      id: Math.floor(Math.random() * 1000),
      email: email,
      role: role
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    
    return new BehaviorSubject<Utilisateur>(user).asObservable();
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Simulation d'inscription
  register(email: string): Observable<boolean> {
    return new BehaviorSubject<boolean>(true).asObservable();
  }
}