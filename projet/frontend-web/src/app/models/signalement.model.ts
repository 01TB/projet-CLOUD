// src/app/models/signalement.model.ts

export interface Localisation {
  lat: number;
  lng: number;
}

export interface StatutAvancement {
  id: number;
  nom: string;
  valeur: number; // 1: Nouveau, 2: En cours, 3: Terminé, 4: Annulé
}

export interface Entreprise {
  id: number;
  nom: string;
}

export interface Role {
  id: number;
  nom: string; // 'Manager' ou 'Visiteur'
}

export interface Utilisateur {
  id: number;
  email: string;
  role: Role;
}

export interface Signalement {
  id: number;
  date_creation: string;
  surface: number; // en m²
  budget: number; // en MGA
  localisation: Localisation;
  entreprise: Entreprise;
  statut_actuel: StatutAvancement;
  id_utilisateur_createur: number;
}

export interface StatistiquesRecap {
  nb_signalements: number;
  surface_totale: number;
  budget_total: number;
  avancement_pct: number;
}