// Famille list item (from GET /api/Familles)
export interface Famille {
  id: string;
  nomPere: string;
  prenomPere: string;
  telephonePrincipal: string;
  ville?: string;
  nombreEnfants: number;
  totalDu: number;
  totalPaye: number;
  soldeGlobal: number;
  statutPaiement: string;
}

// Famille detail (from GET /api/Familles/{id})
export interface FamilleDetail {
  id: string;
  nomPere: string;
  prenomPere: string;
  telephonePere?: string;
  emailPere?: string;
  nomMere?: string;
  prenomMere?: string;
  telephoneMere?: string;
  adresse?: string;
  ville?: string;
  telephonePrincipal: string;
  enfants: FamilleEnfant[];
  totalDu: number;
  totalPaye: number;
  soldeGlobal: number;
}

export interface FamilleEnfant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  solde: number;
}

export interface CreateFamilleRequest {
  nomPere: string;
  prenomPere?: string;
  telephonePrincipal: string;
  telephonePere?: string;
  emailPere?: string;
  nomMere?: string;
  prenomMere?: string;
  telephoneMere?: string;
  adresse?: string;
  ville?: string;
}

export interface UpdateFamilleRequest extends CreateFamilleRequest {
  id: string;
}
