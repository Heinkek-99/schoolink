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
  id: string;
  nomPere: string;
  prenomPere: string;
  nombreEnfants: number;
  totalDu: number;
  totalPaye: number;
  soldeGlobal: number;
  statutPaiement: string;
}
