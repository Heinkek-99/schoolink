import { getPaymentStatus } from '@/utils/constants';

interface PaymentStatusBadgeProps {
  due: number;
  paid: number;
  status?: string;
}

export function PaymentStatusBadge({ due, paid, status }: PaymentStatusBadgeProps) {
  const s = status || getPaymentStatus(due, paid);

  const classMap: Record<string, string> = {
    'À jour': 'status-badge-paid',
    'Partiel': 'status-badge-partial',
    'Impayé': 'status-badge-unpaid',
    'Actif': 'status-badge-active',
    'Inactif': 'status-badge-archived',
    'Archivé': 'status-badge-archived',
  };

  return <span className={classMap[s] || 'status-badge-active'}>{s}</span>;
}
