import { Entreprise } from "./entreprise.model";
import { StatutAvancement } from "./statut-avancement.model";
import { Utilisateur } from "./utilisateur.model";

export interface Signalement {
  id: number;
  date_creation: string;
  surface: number;
  budget: number;
  localisation: {
    lat: number;
    lng: number;
  };
  synchro: boolean;
  id_utilisateur_createur: number;
  id_entreprise: number;
  statut_actuel?: StatutAvancement;
  photos?: string[];
  utilisateur_createur?: Utilisateur;
  entreprise?: Entreprise;
  avancements?: AvancementSignalement[];
}

export interface AvancementSignalement {
  id: number;
  date_modification: Date;
  synchro: boolean;
  id_utilisateur: number;
  id_statut_avancement: number;
  id_signalement: number;
  utilisateur?: Utilisateur;
  statut?: StatutAvancement;
}