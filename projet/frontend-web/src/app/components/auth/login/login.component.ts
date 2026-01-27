// src/app/components/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  selectedRole: 'Manager' | 'Utilisateur' | 'Visiteur' = 'Utilisateur';
  returnUrl = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre email';
      return;
    }

    this.authService.login(this.email, this.selectedRole).subscribe({
      next: (user) => {
        console.log('Connexion réussie:', user);
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la connexion';
        console.error('Erreur connexion:', error);
      }
    });
  }
}