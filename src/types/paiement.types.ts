export interface Paiement {
  id: string;
  familleId: string;
  familleNom?: string;
  datePaiement: string;
  montantTotal: number;
  modePaiement: number;
  reference?: string;
  commentaire?: string;
  ventilations?: Ventilation[];
  createdAt?: string;
}

export interface Ventilation {
  eleveId: string;
  eleveNom?: string;
  montant: number;
  remarque?: string;
}

// Maps to backend enum: Cash=0, MobileMoney=1, Virement=2, Cheque=3
export const MODE_PAIEMENT_MAP: Record<string, number> = {
  'Cash': 0,
  'Mobile Money': 1,
  'Virement': 2,
  'Chèque': 3,
};

// Reverse map: number/string → display name
export const MODE_PAIEMENT_LABEL: Record<number, string> = {
  0: 'Cash',
  1: 'Mobile Money',
  2: 'Virement',
  3: 'Chèque',
};

export function getModePaiementLabel(mode: number | string): string {
  const num = typeof mode === 'string' ? parseInt(mode, 10) : mode;
  return MODE_PAIEMENT_LABEL[num] || `Inconnu (${mode})`;
}

export interface CreatePaiementRequest {
  familleId: string;
  montantTotal: number;
  datePaiement: string;
  modePaiement: number;
  reference?: string;
  commentaire?: string;
  ventilations: { eleveId: string; montant: number; remarque?: string }[];
  enregistrePar?: string;
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
