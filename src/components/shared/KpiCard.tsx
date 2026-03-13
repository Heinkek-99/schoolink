import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  isCurrency?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
}

const colorMap = {
  primary: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    accent: 'border-l-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconText: 'text-success',
    accent: 'border-l-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconText: 'text-warning',
    accent: 'border-l-warning',
  },
  destructive: {
    iconBg: 'bg-destructive/10',
    iconText: 'text-destructive',
    accent: 'border-l-destructive',
  },
  info: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    accent: 'border-l-primary',
  },
};

export function KpiCard({ title, value, icon: Icon, trend, trendUp, isCurrency, color = 'primary' }: KpiCardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;
  const colors = colorMap[color];

  return (
    <div className={`kpi-card border-l-4 ${colors.accent} animate-fade-in`}>
      <div className={`rounded-xl p-3 ${colors.iconBg}`}>
        <Icon size={22} strokeWidth={1.5} className={colors.iconText} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground truncate mt-1">{displayValue}</p>
        {trend && (
          <p className={`text-xs mt-1.5 font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
