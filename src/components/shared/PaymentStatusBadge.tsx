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
    'Impayé à venir': 'status-badge-partial',
    'Actif': 'status-badge-active',
    'Inactif': 'status-badge-archived',
    'Archivé': 'status-badge-archived',
    'Normal': 'status-badge-active',
    'Urgent': 'status-badge-partial',
    'Critique': 'status-badge-unpaid',
  };

  return <span className={classMap[s] || 'status-badge-active'}>{s}</span>;
}
