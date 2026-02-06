// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Utilisateur, Role } from '../models/signalement.model';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  id: number;
  email: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Utilisateur | null>;
  public currentUser$: Observable<Utilisateur | null>;
  private apiUrl = environment.apiUrl;

  private roles: Role[] = [
    { id: 1, nom: 'MANAGER' },
    { id: 2, nom: 'UTILISATEUR' },
    { id: 3, nom: 'VISITEUR' }
  ];

  constructor(private http: HttpClient) {
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
    return this.currentUser$.pipe(
      map(user => user !== null)
    );
  }

  public isManager(): boolean {
    return this.currentUserValue?.role?.nom === 'MANAGER';
  }

  public isUser(): boolean {
    return this.currentUserValue?.role?.nom === 'UTILISATEUR';
  }

  public isVisitor(): boolean {
    return this.currentUserValue?.role?.nom === 'VISITEUR';
  }

  public canCreateSignalement(): boolean {
    return this.isManager() || this.isUser();
  }

  // Connexion avec le backend
  login(email: string, password: string): Observable<Utilisateur> {
    console.log("Begin login process");
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }, { responseType: 'text' as const })
      .pipe(
        map(token => {
          // Le backend retourne juste le token JWT
          // On doit le décoder pour extraire les informations utilisateur
          console.log("Received token:", token);
          const decodedToken = this.decodeToken(token);
          const decoded: any = jwtDecode(token);
          // console.log("jwt decoded:", decoded);
          console.log("Received token:", decodedToken);
          console.log(">>>>>>>>>>>>>>>>>>");
          console.log("role from token:", decodedToken.role);
          const role = this.roles.find(r => r.nom === decodedToken.role) || this.roles[2]; // VISITEUR par défaut
          console.log("Mapped role:", role);
          
          const user: Utilisateur = {
            id: decodedToken.id,
            email: decodedToken.email,
            role: role
          };
          
          // Stocker le token et l'utilisateur
          localStorage.setItem('authToken', token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return user;
        }),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          return throwError(() => new Error('Échec de la connexion'));
        })
      );
  }

  // Décoder le token JWT (simple parsing sans validation)
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return { id: 0, email: '', role: 'VISITEUR' };
    }
  }

  // Récupérer le token d'authentification
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  // Simulation d'inscription
  register(email: string): Observable<boolean> {
    return new BehaviorSubject<boolean>(true).asObservable();
  }

  // Connexion en tant que visiteur (pas d'auth backend requise)
  loginAsVisitor(): Observable<Utilisateur> {
    const visitorRole = this.roles.find(r => r.nom === 'VISITEUR')!;
    const visitor: Utilisateur = {
      id: 0,
      email: 'visiteur@local',
      role: visitorRole
    };

    // Stocker un marqueur minimal en local
    localStorage.setItem('currentUser', JSON.stringify(visitor));
    // Pas de token pour le visiteur, mais on peut stocker une valeur vide
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(visitor);

    return new BehaviorSubject<Utilisateur>(visitor).asObservable();
  }
}