import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { useDashboardStats } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { Banknote, AlertTriangle, TrendingUp, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancesPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();
  const { canCreate } = usePermissions();

  const classeChartData = useMemo(() =>
    stats?.statistiquesParClasse
      ?.filter((c) => c.nombreEleves > 0)
      .map((c) => ({ nom: c.nomClasse, taux: c.tauxRecouvrement })) || [],
    [stats]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Finances" subtitle="Tableau de bord financier">
        {canCreate('paiements') && (
          <button
            onClick={() => navigate('/finances/paiement')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Nouveau paiement
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Frais attendus" value={stats?.totalFraisAttendus ?? 0} icon={Banknote} isCurrency color="primary" tooltipContent="Montant total des frais de scolarité attendus" />
            <KpiCard title="Total encaissé" value={stats?.totalEncaisse ?? 0} icon={Banknote} isCurrency color="success" tooltipContent="Montant total des paiements reçus" />
            <KpiCard title="Solde impayé" value={stats?.soldeGlobal ?? 0} icon={AlertTriangle} isCurrency color="destructive" tooltipContent="Montant restant à recouvrer" />
            <KpiCard title="Taux recouvrement" value={`${stats?.tauxRecouvrement ?? 0}%`} icon={TrendingUp} color="warning" tooltipContent="Pourcentage du montant attendu déjà encaissé" />
          </>
        )}
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <div className="mb-5">
          <h3 className="font-semibold text-foreground mb-1">Taux de recouvrement par classe</h3>
          <p className="text-xs text-muted-foreground">Pourcentage de recouvrement par classe</p>
        </div>
        {classeChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={classeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="nom" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="taux" fill="hsl(152,69%,41%)" radius={[6, 6, 0, 0]} name="Taux %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">Aucune donnée disponible</div>
        )}
      </div>
    </div>
  );
}
