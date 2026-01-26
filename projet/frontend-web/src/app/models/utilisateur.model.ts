import { Role } from "./role.model";

export interface Utilisateur {
  id: number;
  email: string;
  password: string;
  synchro: boolean;
  id_role: number;
  role?: Role;
  bloque?: boolean;
  date_blocage?: Date;
}