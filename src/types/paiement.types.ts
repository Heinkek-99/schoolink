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

// Maps to backend enum: Especes=1, Cheque=2, Virement=3, MobileMoney=4, CarteCredit=5
export const MODE_PAIEMENT_MAP: Record<string, number> = {
  'Espèces': 1,
  'Chèque': 2,
  'Virement': 3,
  'Mobile Money': 4,
  'Carte de crédit': 5,
};

export const MODE_PAIEMENT_LABEL: Record<number, string> = {
  1: 'Espèces',
  2: 'Chèque',
  3: 'Virement',
  4: 'Mobile Money',
  5: 'Carte de crédit',
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
