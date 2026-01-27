import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { Utilisateur } from '../../../models/utilisateur.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  searchTerm = '';

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.utilisateurService.getUtilisateurs().subscribe(users => {
      this.utilisateurs = users;
      this.filteredUsers = [...users];
    });
  }

  toggleBlockUser(user: Utilisateur): void {
    const shouldBlock = !user.bloque;
    this.utilisateurService.toggleBlockUser(user.id, shouldBlock).subscribe({
      next: () => {
        user.bloque = shouldBlock;
        user.date_blocage = shouldBlock ? new Date() : undefined;
      },
      error: (error) => {
        console.error('Erreur blocage utilisateur:', error);
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.utilisateurs];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.utilisateurs.filter(user =>
      user.email.toLowerCase().includes(term) ||
      user.role?.nom.toLowerCase().includes(term)
    );
  }

  getStatusBadgeClass(user: Utilisateur): string {
    if (user.bloque) return 'badge-danger';
    return 'badge-success';
  }

  getStatusText(user: Utilisateur): string {
    return user.bloque ? 'Bloqué' : 'Actif';
  }
}