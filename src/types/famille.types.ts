export interface Famille {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  nombreEnfants: number;
  totalDu: number;
  totalPaye: number;
  solde: number;
  statut: 'À jour' | 'Partiel' | 'Impayé';
  enfants?: FamilleEnfant[];
  createdAt?: string;
}

export interface FamilleEnfant {
  id: string;
  nom: string;
  prenom: string;
  classe: string;
  totalDu: number;
  totalPaye: number;
  solde: number;
  statut: string;
}

export interface CreateFamilleRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  ville?: string;
}

export interface UpdateFamilleRequest extends CreateFamilleRequest {
  id: string;
}
