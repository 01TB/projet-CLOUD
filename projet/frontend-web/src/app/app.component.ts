// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'SIG Signalements Routiers - Antananarivo';
  isOnline = navigator.onLine;
  syncPending = 0;
  showFilters = false;
  
  // Observables du service auth
  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated$;
  
  // Observable pour vérifier si l'utilisateur est admin
  isAdmin$: Observable<boolean> = this.authService.currentUser$.pipe(
    map(user => user?.role?.nom === 'Administrateur')
  );
  
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private syncService: SyncService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Surveiller la navigation pour afficher/masquer les filtres
    const routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showFilters = event.url === '/map' || event.url === '/';
      });
    
    // Surveiller l'état de la connexion
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
    
    // Charger les statistiques de synchronisation
    this.loadSyncStats();

    this.subscriptions.add(routerSub);
  }

  private updateOnlineStatus(): void {
    this.isOnline = navigator.onLine;
    if (this.isOnline) {
      // TODO: Tenter une synchronisation automatique
      console.log('Connexion rétablie - synchronisation...');
    }
  }

  private loadSyncStats(): void {
    this.syncService.getSyncStats().subscribe(stats => {
      this.syncPending = stats.pending;
    });
  }

  onFiltersChanged(filters: any): void {
    // Transmettre les filtres au composant map via un service ou EventEmitter
    console.log('Filtres appliqués:', filters);
  }

  goToSync(): void {
    this.router.navigate(['/sync']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', () => this.updateOnlineStatus());
    window.removeEventListener('offline', () => this.updateOnlineStatus());
    this.subscriptions.unsubscribe();
  }
}