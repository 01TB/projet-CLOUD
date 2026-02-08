// src/app/components/signalement-detail/signalement-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalementService } from '../../services/signalement.service';
import { Signalement } from '../../models/signalement.model';
import photoData from '../../../assets/img/login_image_data.json';

@Component({
  selector: 'app-signalement-detail',
  templateUrl: './signalement-detail.component.html',
  styleUrls: ['./signalement-detail.component.css']
})
export class SignalementDetailComponent implements OnInit, OnDestroy {
  signalement: Signalement | null = null;
  loading = false;
  errorMessage = '';
  
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalementService: SignalementService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSignalement(parseInt(id, 10));
    } else {
      this.errorMessage = 'ID du signalement manquant';
    }
  }

  private loadSignalement(id: number): void {
    this.loading = true;
    
    const sub = this.signalementService.getSignalementById(id).subscribe({
      next: (signalement) => {
        this.signalement = signalement;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du signalement';
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  getStatutBadgeClass(statutNom: string): string {
    const classes: { [key: string]: string } = {
      'Nouveau': 'badge-nouveau',
      'En cours': 'badge-encours',
      'Terminé': 'badge-termine',
      'Annulé': 'badge-annule'
    };
    return classes[statutNom] || 'badge-default';
  }

  getStatutIcon(statutNom: string): string {
    const icons: { [key: string]: string } = {
      'Nouveau': '🆕',
      'En cours': '🚧',
      'Terminé': '✅',
      'Annulé': '❌'
    };
    return icons[statutNom] || '📋';
  }

  formatDate(date: string): string {
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

  getDefaultPhoto(): string {
    return photoData.photo;
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
