export function generateMatricule(year: number, index: number): string {
  return `EL${year}${String(index).padStart(5, '0')}`;
}

export function getPaymentStatus(due: number, paid: number): 'À jour' | 'Partiel' | 'Impayé' {
  if (paid >= due) return 'À jour';
  if (paid > 0) return 'Partiel';
  return 'Impayé';
}

export function getRecoveryRate(due: number, paid: number): string {
  if (due === 0) return '0%';
  return Math.round((paid / due) * 100) + '%';
}

export const PAYMENT_MODES = ['Cash', 'Mobile Money', 'Virement', 'Chèque'] as const;

export const ANNEE_SCOLAIRE = '2024-2025';
