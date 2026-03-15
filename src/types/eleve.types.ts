// Eleve list item (from GET /api/Eleves)
export interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: string;       // 'M' | 'F' | 'Masculin' | 'Féminin' | '1' | '2'
  classe: string;
  classeId?: string;
  famille: string;
  familleId?: string;
  solde: number;
  statut: string;
}

// Eleve dossier (from GET /api/Eleves/{id})
export interface EleveDossier {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  photoPath?: string;
  classe: string;
  famille: string;
  nationalite?: string;
  groupeSanguin?: string;
  allergies?: string;
  contactUrgence?: string;
  remarques?: string;
  dateInscription?: string;
  frais: EleveFrais[];
  totalDu: number;
  totalPaye: number;
  solde: number;
}

export interface EleveFrais {
  id: string;
  libelle: string;
  montant: number;
  montantPaye: number;
  echeance: string;
  isEchu: boolean;
  periode?: string;
}

export interface Classe {
  id: string;
  code: string;
  nom: string;
  niveau: string;
  effectif: number;
  capaciteMax: number;
  estComplete: boolean;
}

export interface CreateEleveRequest {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string | number;
  classeId: string;
  familleId: string;
  nationalite?: string;
  groupeSanguin?: string;
  allergies?: string;
  contactUrgence?: string;
  remarques?: string;
  photo?: File;
}

export interface UpdateEleveRequest {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  classeId?: string;
  nationalite?: string;
  groupeSanguin?: string;
  allergies?: string;
  contactUrgence?: string;
  remarques?: string;
  photo?: File;
}
