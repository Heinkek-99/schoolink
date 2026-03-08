interface PaymentStatusBadgeProps {
  status?: string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const s = status || 'Inconnu';

  const classMap: Record<string, string> = {
    'À jour': 'status-badge-paid',
    'Payé': 'status-badge-paid',
    'Partiel': 'status-badge-partial',
    'Impayé': 'status-badge-unpaid',
    'Actif': 'status-badge-active',
    'Inactif': 'status-badge-archived',
    'Archivé': 'status-badge-archived',
  };

  return <span className={classMap[s] || 'status-badge-active'}>{s}</span>;
}
