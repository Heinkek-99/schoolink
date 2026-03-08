export interface DashboardStats {
  totalEleves: number;
  totalFamilles: number;
  totalFraisAttendus: number;
  totalEncaisse: number;
  soldeGlobal: number;
  tauxRecouvrement: number;
  statistiquesParClasse: StatistiqueClasse[];
}

export interface StatistiqueClasse {
  nomClasse: string;
  nombreEleves: number;
  tauxRecouvrement: number;
}

export interface FamilleImpayee {
  familleId: string;
  nomFamille: string;
  telephone: string;
  nombreEnfants: number;
  montantDu: number;
  montantPaye: number;
  soldeRestant: number;
  prochaineEcheance: string;
  joursRetard: number;
  niveauPriorite: string;
  statutImpaie: string;
}
