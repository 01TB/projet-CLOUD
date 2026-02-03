// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SIG Signalements Routiers - Antananarivo';
  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated$;
  showSidebar = false;
  private currentRoute = '';

  // Observables pour les rôles
  isManager$ = this.authService.currentUser$.pipe(
    map(user => user?.role?.nom === 'MANAGER')
  );
  
  isUser$ = this.authService.currentUser$.pipe(
    map(user => user?.role?.nom === 'UTILISATEUR')
  );

  constructor(
    private authService: AuthService,
    private syncService: SyncService,
    private router: Router
  ) {}

  // Indicateur de synchronisation longue
  isSyncing = false;

  ngOnInit(): void {
    // Écouter les changements de route pour afficher/masquer la sidebar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        this.updateSidebarVisibility();
      });

    // Écouter les changements d'authentification pour mettre à jour la sidebar
    this.authService.currentUser$.subscribe(() => {
      this.updateSidebarVisibility();
    });

    // Initialiser la visibilité de la sidebar selon la route actuelle
    this.currentRoute = this.router.url;
    this.updateSidebarVisibility();
  }

  private updateSidebarVisibility(): void {
    // Afficher la sidebar uniquement sur les routes / et /map quand l'utilisateur est connecté
    const isMapRoute = this.currentRoute === '/' || this.currentRoute === '/map' || this.currentRoute.startsWith('/map');
    const isAuthenticated = this.authService.currentUserValue !== null;
    this.showSidebar = isMapRoute && isAuthenticated;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSync(): void {
    const confirmation = confirm(
      'Synchronisation avec Firebase\n\n' +
      'Cela va synchroniser toutes les données (Signalements, Statuts, Avancements).\n\n' +
      'Continuer ?'
    );

    if (!confirmation) {
      return;
    }

    const syncEntities = ['Signalement', 'StatutAvancement', 'AvancementSignalement'];

    // Afficher l'overlay de chargement
    this.isSyncing = true;

    this.syncService.synchronizeBidirectional(syncEntities, false).subscribe({
      next: (response) => {
        console.log('Synchronisation terminée:', response);
        this.isSyncing = false;

        if (response.success) {
          alert(
            '✅ Synchronisation réussie !\n\n' +
            response.message +
            '\n\nLa page va se recharger pour afficher les nouvelles données.'
          );

          // Recharger la page pour mettre à jour toutes les données
          window.location.reload();
        } else {
          alert(
            '❌ Erreur de synchronisation\n\n' +
            response.message +
            (response.errors && response.errors.length > 0 
              ? '\n\nErreurs:\n' + response.errors.join('\n') 
              : '')
          );
        }
      },
      error: (error) => {
        console.error('Erreur lors de la synchronisation:', error);
        this.isSyncing = false;
        alert(
          '❌ Erreur de synchronisation\n\n' +
          (error.error?.message || error.message || 'Erreur inconnue') +
          '\n\nVeuillez vérifier la connexion au serveur.'
        );
      }
    });
  }
}