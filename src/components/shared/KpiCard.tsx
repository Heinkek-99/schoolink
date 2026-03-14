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
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  destructive: 'bg-red-100 text-red-600',
  info: 'bg-primary/10 text-primary',
  // primary: {
  //   iconBg: 'bg-primary/10',
  //   iconText: 'text-primary',
  // },
  // success: {
  //   iconBg: 'bg-emerald-100',
  //   iconText: 'text-emerald-600',
  // },
  // warning: {
  //   iconBg: 'bg-amber-100',
  //   iconText: 'text-amber-600',
  // },
  // destructive: {
  //   iconBg: 'bg-red-100',
  //   iconText: 'text-red-600',
  // },
  // info: {
  //   iconBg: 'bg-primary/10',
  //   iconText: 'text-primary',
  // },
};

export function KpiCard({ title, value, icon: Icon, trend, trendUp, isCurrency, color = 'primary' }: KpiCardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div className={`kpi-card animate-fade-in`}>
      <div className={`rounded-xl p-3 ${colorMap[color]}`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
        <p className="text-xl font-bold text-foreground truncate">{displayValue}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
