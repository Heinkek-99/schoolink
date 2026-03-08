export interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  photo?: string;
  classeId: string;
  classe?: string;
  familleId: string;
  familleNom?: string;
  anneeScolaire?: string;
  statut: 'Actif' | 'Inactif' | 'Archivé';
  totalDu?: number;
  totalPaye?: number;
  solde?: number;
  frais?: EleveFrais[];
  paiements?: ElevePaiement[];
}

export interface EleveFrais {
  id: string;
  typeFrais: string;
  montant: number;
  paye: number;
  solde: number;
  statut: string;
  echeance?: string;
}

export interface ElevePaiement {
  id: string;
  date: string;
  montant: number;
  mode: string;
  reference?: string;
}

export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  effectif?: number;
}

export interface CreateEleveRequest {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  photo?: string;
  classeId: string;
  familleId: string;
}
