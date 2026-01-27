// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

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

  // Observables pour les rôles
  isManager$ = this.authService.currentUser$.pipe(
    map(user => user?.role?.nom === 'Manager')
  );
  
  isUser$ = this.authService.currentUser$.pipe(
    map(user => user?.role?.nom === 'Utilisateur')
  );

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showSidebar = event.url === '/' || event.url === '/map';
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}