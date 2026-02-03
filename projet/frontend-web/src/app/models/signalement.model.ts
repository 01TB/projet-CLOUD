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
  nom: string; // 'Manager', 'Utilisateur' ou 'Visiteur'
}

export interface Utilisateur {
  id: number;
  email: string;
  role: Role;
  date_creation?: string;
  est_bloque?: boolean;
  date_blocage?: string | null;
}

export interface UtilisateurBloque {
  id: number;
  date_blocage: string;
  id_utilisateur: number;
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

// Interface correspondant au SignalementResponseDTO du backend
export interface SignalementResponseDTO {
  id: number;
  dateCreation: string;
  surface: number;
  budget: number;
  localisation: string; // Format WKT (ex: "POINT(47.5236 -18.8792)")
  synchro: boolean;
  idUtilisateurCreateur: number;
  emailUtilisateurCreateur: string;
  idEntreprise: number | null;
  nomEntreprise: string | null;
  avancements: AvancementResponseDTO[]; // Liste des avancements
}

// Interface pour les avancements de signalement
export interface AvancementResponseDTO {
  id: number;
  dateModification: string;
  idUtilisateur: number;
  emailUtilisateur: string;
  idStatutAvancement: number;
  nomStatutAvancement: string;
  valeurStatutAvancement: number;
}