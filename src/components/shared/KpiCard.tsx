import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCountUp } from '@/hooks/useCountUp';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  isCurrency?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  tooltipContent?: string;
}

const borderColorMap = {
  primary: 'border-l-[hsl(217,91%,60%)]',
  success: 'border-l-[hsl(152,69%,41%)]',
  warning: 'border-l-[hsl(38,92%,50%)]',
  destructive: 'border-l-[hsl(0,72%,51%)]',
  info: 'border-l-[hsl(199,89%,48%)]',
};

const iconBgMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  destructive: 'bg-red-100 text-red-600',
  info: 'bg-sky-100 text-sky-600',
};

export function KpiCard({ title, value, icon: Icon, trend, trendUp, isCurrency, color = 'primary', tooltipContent }: KpiCardProps) {
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(numericValue);
  const isNumeric = typeof value === 'number';
  const displayValue = isNumeric
    ? (isCurrency ? formatCurrency(animatedValue) : animatedValue.toLocaleString('fr-FR'))
    : value;

  const card = (
    <div className={`kpi-card border-l-4 ${borderColorMap[color]}`}>
      <div className={`rounded-xl p-3 ${iconBgMap[color]}`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground truncate mt-0.5">{displayValue}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent><p>{tooltipContent}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return card;
}
