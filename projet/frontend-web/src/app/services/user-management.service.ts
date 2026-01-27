// src/app/services/user-management.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Utilisateur, Role, UtilisateurBloque } from '../models/signalement.model';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private roles: Role[] = [
    { id: 1, nom: 'Manager' },
    { id: 2, nom: 'Utilisateur' },
    { id: 3, nom: 'Visiteur' }
  ];

  private utilisateurs: Utilisateur[] = [
    {
      id: 1,
      email: 'admin@antananarivo.mg',
      role: this.roles[0],
      date_creation: '2024-01-01',
      est_bloque: false,
      date_blocage: null
    },
    {
      id: 2,
      email: 'jean.rakoto@gmail.com',
      role: this.roles[1],
      date_creation: '2024-01-15',
      est_bloque: false,
      date_blocage: null
    },
    {
      id: 3,
      email: 'marie.rasoa@gmail.com',
      role: this.roles[1],
      date_creation: '2024-01-18',
      est_bloque: true,
      date_blocage: '2024-01-25'
    },
    {
      id: 4,
      email: 'paul.andry@yahoo.fr',
      role: this.roles[1],
      date_creation: '2024-01-20',
      est_bloque: false,
      date_blocage: null
    },
    {
      id: 5,
      email: 'visiteur@public.mg',
      role: this.roles[2],
      date_creation: '2024-01-22',
      est_bloque: false,
      date_blocage: null
    },
    {
      id: 6,
      email: 'sophie.randria@hotmail.com',
      role: this.roles[1],
      date_creation: '2024-01-24',
      est_bloque: false,
      date_blocage: null
    },
    {
      id: 7,
      email: 'david.rado@gmail.com',
      role: this.roles[1],
      date_creation: '2024-01-26',
      est_bloque: false,
      date_blocage: null
    },
    {
      id: 8,
      email: 'manager2@antananarivo.mg',
      role: this.roles[0],
      date_creation: '2024-01-10',
      est_bloque: false,
      date_blocage: null
    }
  ];

  private utilisateursSubject = new BehaviorSubject<Utilisateur[]>(this.utilisateurs);
  public utilisateurs$ = this.utilisateursSubject.asObservable();

  constructor() {}

  getAllUsers(): Observable<Utilisateur[]> {
    return of([...this.utilisateurs]).pipe(delay(300));
  }

  getUserById(id: number): Observable<Utilisateur | undefined> {
    const user = this.utilisateurs.find(u => u.id === id);
    return of(user).pipe(delay(100));
  }

  getUsersByRole(roleName: string): Observable<Utilisateur[]> {
    const filtered = this.utilisateurs.filter(u => u.role.nom === roleName);
    return of(filtered).pipe(delay(200));
  }

  getBlockedUsers(): Observable<Utilisateur[]> {
    const blocked = this.utilisateurs.filter(u => u.est_bloque === true);
    return of(blocked).pipe(delay(200));
  }

  createUser(email: string, roleId: number): Observable<Utilisateur> {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Rôle invalide');
    }

    const newId = Math.max(...this.utilisateurs.map(u => u.id)) + 1;
    const newUser: Utilisateur = {
      id: newId,
      email: email,
      role: role,
      date_creation: new Date().toISOString().split('T')[0],
      est_bloque: false,
      date_blocage: null
    };

    this.utilisateurs.push(newUser);
    this.utilisateursSubject.next([...this.utilisateurs]);
    return of(newUser).pipe(delay(300));
  }

  updateUserRole(userId: number, newRoleId: number): Observable<Utilisateur> {
    const user = this.utilisateurs.find(u => u.id === userId);
    const newRole = this.roles.find(r => r.id === newRoleId);

    if (!user || !newRole) {
      throw new Error('Utilisateur ou rôle invalide');
    }

    user.role = newRole;
    this.utilisateursSubject.next([...this.utilisateurs]);
    return of(user).pipe(delay(200));
  }

  blockUser(userId: number): Observable<Utilisateur> {
    const user = this.utilisateurs.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    if (user.role.nom === 'Manager') {
      throw new Error('Impossible de bloquer un Manager');
    }

    user.est_bloque = true;
    user.date_blocage = new Date().toISOString().split('T')[0];
    this.utilisateursSubject.next([...this.utilisateurs]);
    return of(user).pipe(delay(200));
  }

  unblockUser(userId: number): Observable<Utilisateur> {
    const user = this.utilisateurs.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    user.est_bloque = false;
    user.date_blocage = null;
    this.utilisateursSubject.next([...this.utilisateurs]);
    return of(user).pipe(delay(200));
  }

  deleteUser(userId: number): Observable<boolean> {
    const index = this.utilisateurs.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error('Utilisateur introuvable');
    }

    const user = this.utilisateurs[index];
    if (user.role.nom === 'Manager') {
      throw new Error('Impossible de supprimer un Manager');
    }

    this.utilisateurs.splice(index, 1);
    this.utilisateursSubject.next([...this.utilisateurs]);
    return of(true).pipe(delay(200));
  }

  getRoles(): Observable<Role[]> {
    return of(this.roles);
  }

  getStatistics(): Observable<{
    total: number;
    managers: number;
    utilisateurs: number;
    visiteurs: number;
    bloques: number;
  }> {
    return of({
      total: this.utilisateurs.length,
      managers: this.utilisateurs.filter(u => u.role.nom === 'Manager').length,
      utilisateurs: this.utilisateurs.filter(u => u.role.nom === 'Utilisateur').length,
      visiteurs: this.utilisateurs.filter(u => u.role.nom === 'Visiteur').length,
      bloques: this.utilisateurs.filter(u => u.est_bloque === true).length
    }).pipe(delay(100));
  }
}