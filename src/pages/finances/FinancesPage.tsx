import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Banknote, TrendingUp, AlertTriangle, Percent, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

const encaissementsMock = [
  { mois: 'Oct', montant: 4500000 },
  { mois: 'Nov', montant: 3800000 },
  { mois: 'Déc', montant: 5200000 },
  { mois: 'Jan', montant: 6100000 },
  { mois: 'Fév', montant: 4900000 },
  { mois: 'Mar', montant: 5800000 },
];

export default function FinancesPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <PageHeader title="Finances" subtitle="Tableau de bord financier">
        <button
          onClick={() => navigate('/finances/paiement')}
          className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
        >
          <Plus size={18} /> Nouveau paiement
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total encaissé" value={stats?.totalEncaissements ?? 0} icon={Banknote} isCurrency color="success" />
            <KpiCard title="Total impayés" value={stats?.totalImpayes ?? 0} icon={AlertTriangle} isCurrency color="destructive" />
            <KpiCard title="Taux recouvrement" value={`${stats?.tauxRecouvrement ?? 0}%`} icon={Percent} color="primary" />
            <KpiCard title="Tendance" value="+12%" icon={TrendingUp} color="success" trend="vs mois précédent" trendUp />
          </>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-5">
        <h3 className="font-semibold text-foreground mb-4">Encaissements mensuels</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={encaissementsMock}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="mois" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="montant" fill="hsl(160,84%,39%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
