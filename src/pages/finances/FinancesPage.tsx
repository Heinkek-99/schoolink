import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { useDashboardStats } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { Banknote, AlertTriangle, Percent, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

export default function FinancesPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();
  const { canCreate } = usePermissions();

  const classeChartData = stats?.statistiquesParClasse
    ?.filter((c) => c.nombreEleves > 0)
    .map((c) => ({ nom: c.nomClasse, taux: c.tauxRecouvrement })) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Finances" subtitle="Tableau de bord financier">
        {canCreate('paiements') && (
          <button
            onClick={() => navigate('/finances/paiement')}
            className="flex items-center gap-2 px-4 py-2.5 bg-success text-success-foreground rounded-xl text-sm font-semibold hover:bg-success/90 transition-colors shadow-sm"
          >
            <Plus size={18} /> Nouveau paiement
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Frais attendus" value={stats?.totalFraisAttendus ?? 0} icon={Banknote} isCurrency color="primary" />
            <KpiCard title="Total encaissé" value={stats?.totalEncaisse ?? 0} icon={Banknote} isCurrency color="success" />
            <KpiCard title="Solde impayé" value={stats?.soldeGlobal ?? 0} icon={AlertTriangle} isCurrency color="destructive" />
            <KpiCard title="Taux recouvrement" value={`${stats?.tauxRecouvrement ?? 0}%`} icon={TrendingUp} color="warning" />
          </>
        )}
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <div className="mb-5">
          <h3 className="font-semibold text-foreground">Taux de recouvrement par classe</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pourcentage de recouvrement par classe</p>
        </div>
        {classeChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={classeChartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
              <XAxis dataKey="nom" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(220, 13%, 91%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="taux" fill="hsl(152,69%,41%)" radius={[8, 8, 0, 0]} name="Taux %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-muted-foreground text-sm">Aucune donnée disponible</div>
        )}
      </div>
    </div>
  );
}
