import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  isCurrency?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
  },
};

export function KpiCard({ title, value, icon: Icon, trend, trendUp, isCurrency, color = 'primary' }: KpiCardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;
  const colors = colorMap[color];

  return (
    <div className="bg-card rounded-xl border shadow-sm p-5 flex items-start gap-4 animate-fade-in hover:shadow-md transition-shadow">
      <div className={`rounded-xl p-3 ${colors.bg} ${colors.text}`}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-foreground truncate">{displayValue}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
