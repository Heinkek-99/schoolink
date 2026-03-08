export interface Paiement {
  id: string;
  familleId: string;
  familleNom?: string;
  date: string;
  montant: number;
  mode: 'Cash' | 'Mobile Money' | 'Virement' | 'Chèque';
  reference?: string;
  ventilations?: Ventilation[];
  createdAt?: string;
}

export interface Ventilation {
  eleveId: string;
  eleveNom?: string;
  montant: number;
}

export interface CreatePaiementRequest {
  familleId: string;
  date: string;
  montant: number;
  mode: string;
  reference?: string;
  ventilations: Ventilation[];
}

export interface TypeFrais {
  id: string;
  nom: string;
  montant: number;
  description?: string;
}

export interface CreateTypeFraisRequest {
  nom: string;
  montant: number;
  description?: string;
}
