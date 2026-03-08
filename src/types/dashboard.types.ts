export interface DashboardStats {
  totalEleves: number;
  totalFamilles: number;
  totalEncaissements: number;
  totalImpayes: number;
  tauxRecouvrement: number;
  elevesActifs?: number;
  nouveauxInscrits?: number;
}

export interface FamilleImpayee {
  id: string;
  nom: string;
  nombreEnfants: number;
  montantDu: number;
  statut: string;
}

export interface EncaissementMensuel {
  mois: string;
  montant: number;
}

export interface RepartitionStatut {
  statut: string;
  nombre: number;
  pourcentage: number;
}
