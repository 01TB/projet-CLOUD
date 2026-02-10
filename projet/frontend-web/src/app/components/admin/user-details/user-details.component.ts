// src/app/components/admin/user-details/user-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserManagementService } from '../../../services/user-management.service';
import { SignalementService } from '../../../services/signalement.service';
import { Utilisateur, Signalement } from '../../../models/signalement.model';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user: Utilisateur | null = null;
  signalements: Signalement[] = [];
  
  loading = false;
  loadingSignalements = false;
  errorMessage = '';
  
  // Statistiques des signalements
  stats = {
    total: 0,
    nouveau: 0,
    enCours: 0,
    termine: 0
  };

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userManagementService: UserManagementService,
    private signalementService: SignalementService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(parseInt(id, 10));
    } else {
      this.errorMessage = 'ID utilisateur manquant';
    }
  }

  private loadUser(id: number): void {
    this.loading = true;
    
    const userSub = this.userManagementService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.loadUserSignalements(id);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'utilisateur';
        this.loading = false;
      }
    });

    this.subscriptions.add(userSub);
  }

  private loadUserSignalements(userId: number): void {
    this.loadingSignalements = true;
    
    const sigSub = this.signalementService.getSignalementsByUtilisateur(userId).subscribe({
      next: (signalements) => {
        this.signalements = signalements;
        this.computeStats();
        this.loadingSignalements = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des signalements:', error);
        this.loadingSignalements = false;
      }
    });

    this.subscriptions.add(sigSub);
  }

  private computeStats(): void {
    this.stats.total = this.signalements.length;
    this.stats.nouveau = this.signalements.filter(s => s.statut_actuel.valeur === 0).length;
    this.stats.enCours = this.signalements.filter(s => s.statut_actuel.valeur === 1).length;
    this.stats.termine = this.signalements.filter(s => s.statut_actuel.valeur === 2).length;
  }

  getRoleBadgeClass(roleName: string): string {
    const classes: { [key: string]: string } = {
      'Manager': 'badge-manager',
      'Utilisateur': 'badge-user',
      'Visiteur': 'badge-visitor'
    };
    return classes[roleName] || 'badge-default';
  }

  getStatutBadgeClass(statutNom: string): string {
    const classes: { [key: string]: string } = {
      'NOUVEAU': 'badge-nouveau',
      'EN_COURS': 'badge-encours',
      'TERMINE': 'badge-termine'
    };
    return classes[statutNom] || 'badge-default';
  }

  getStatutIcon(statutNom: string): string {
    const icons: { [key: string]: string } = {
      'NOUVEAU': '🆕',
      'EN_COURS': '🚧',
      'TERMINE': '✅'
    };
    return icons[statutNom] || '📋';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  formatBudget(budget: number): string {
    return new Intl.NumberFormat('fr-FR').format(budget) + ' MGA';
  }

  formatSurface(surface: number): string {
    return surface.toFixed(2) + ' m²';
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  viewSignalement(id: number): void {
    this.router.navigate(['/signalement', id]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
