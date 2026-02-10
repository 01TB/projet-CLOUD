// src/app/components/admin/user-management/user-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserManagementService } from '../../../services/user-management.service';
import { Utilisateur, Role } from '../../../models/signalement.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  utilisateurs: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  roles: Role[] = [];
  
  // Filtres
  searchTerm = '';
  selectedRoleFilter = '';
  showBlockedOnly = false;
  
  // Statistiques
  stats = {
    total: 0,
    managers: 0,
    utilisateurs: 0,
    visiteurs: 0,
    bloques: 0
  };
  
  // Modals
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showBlockModal = false;
  
  // Formulaire de création
  newUserEmail = '';
  newUserPassword = '';
  newUserRoleId: number | null = null;
  
  // Utilisateur sélectionné
  selectedUser: Utilisateur | null = null;
  editRoleId: number | null = null;
  
  // État
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  private subscriptions = new Subscription();

  constructor(
    private userManagementService: UserManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    
    const usersSub = this.userManagementService.getAllUsers().subscribe({
      next: (users) => {
        this.utilisateurs = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des utilisateurs');
        this.loading = false;
      }
    });

    const rolesSub = this.userManagementService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });

    const statsSub = this.userManagementService.getStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
      }
    });

    this.subscriptions.add(usersSub);
    this.subscriptions.add(rolesSub);
    this.subscriptions.add(statsSub);
  }

  applyFilters(): void {
    let filtered = [...this.utilisateurs];

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(term)
      );
    }

    // Filtre par rôle
    if (this.selectedRoleFilter) {
      filtered = filtered.filter(u => u.role.nom === this.selectedRoleFilter);
    }

    // Filtre bloqués
    if (this.showBlockedOnly) {
      filtered = filtered.filter(u => u.est_bloque === true);
    }

    this.filteredUsers = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRoleFilter = '';
    this.showBlockedOnly = false;
    this.applyFilters();
  }

  // Création d'utilisateur
  openCreateModal(): void {
    this.newUserEmail = '';
    this.newUserPassword = '';
    this.newUserRoleId = 2; // Utilisateur par défaut
    this.showCreateModal = true;
    this.clearMessages();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newUserEmail = '';
    this.newUserPassword = '';
    this.newUserRoleId = null;
  }

  createUser(): void {
    if (!this.newUserEmail || !this.newUserPassword || !this.newUserRoleId) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUserEmail)) {
      this.showError('Email invalide');
      return;
    }

    // Validation mot de passe
    if (this.newUserPassword.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.loading = true;
    this.userManagementService.createUser(this.newUserEmail, this.newUserPassword, this.newUserRoleId).subscribe({
      next: (newUser) => {
        this.showSuccess(`Utilisateur ${newUser.email} créé avec succès`);
        this.closeCreateModal();
        this.loadData();
      },
      error: (error) => {
        this.showError(error.message || 'Erreur lors de la création');
        this.loading = false;
      }
    });
  }

  // Modification d'utilisateur
  openEditModal(user: Utilisateur): void {
    this.selectedUser = user;
    this.editRoleId = user.role.id;
    this.showEditModal = true;
    this.clearMessages();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editRoleId = null;
  }

  updateUserRole(): void {
    if (!this.selectedUser || !this.editRoleId) {
      return;
    }

    this.loading = true;
    this.userManagementService.updateUserRole(this.selectedUser.id, this.editRoleId).subscribe({
      next: (updatedUser) => {
        this.showSuccess(`Rôle de ${updatedUser.email} modifié avec succès`);
        this.closeEditModal();
        this.loadData();
      },
      error: (error) => {
        this.showError('Erreur lors de la modification');
        this.loading = false;
      }
    });
  }

  // Blocage/Déblocage
  openBlockModal(user: Utilisateur): void {
    this.selectedUser = user;
    this.showBlockModal = true;
    this.clearMessages();
  }

  closeBlockModal(): void {
    this.showBlockModal = false;
    this.selectedUser = null;
  }

  toggleBlockUser(): void {
    if (!this.selectedUser) {
      return;
    }

    this.loading = true;
    const action = this.selectedUser.est_bloque ? 'unblockUser' : 'blockUser';
    
    this.userManagementService[action](this.selectedUser.id).subscribe({
      next: (updatedUser) => {
        const status = updatedUser.est_bloque ? 'bloqué' : 'débloqué';
        this.showSuccess(`Utilisateur ${status} avec succès`);
        this.closeBlockModal();
        this.loadData();
      },
      error: (error) => {
        this.showError(error.message || 'Erreur lors de l\'opération');
        this.loading = false;
        this.closeBlockModal();
      }
    });
  }

  // Suppression
  openDeleteModal(user: Utilisateur): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
    this.clearMessages();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  deleteUser(): void {
    if (!this.selectedUser) {
      return;
    }

    this.loading = true;
    this.userManagementService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.showSuccess('Utilisateur supprimé avec succès');
        this.closeDeleteModal();
        this.loadData();
      },
      error: (error) => {
        this.showError(error.message || 'Erreur lors de la suppression');
        this.loading = false;
        this.closeDeleteModal();
      }
    });
  }

  // Utilitaires
  getRoleBadgeClass(roleName: string): string {
    const classes: { [key: string]: string } = {
      'Manager': 'badge-manager',
      'Utilisateur': 'badge-user',
      'Visiteur': 'badge-visitor'
    };
    return classes[roleName] || 'badge-default';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  viewUserDetails(userId: number): void {
    this.router.navigate(['/admin/users', userId]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}