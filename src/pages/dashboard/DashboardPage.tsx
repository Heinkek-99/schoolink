import { Users, GraduationCap, Banknote, AlertTriangle, Plus, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDashboardStats, useFamillesImpayes } from '@/hooks/useDashboard';
import { formatCurrency } from '@/utils/formatCurrency';

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: impayes, isLoading: impayesLoading } = useFamillesImpayes();

  // Build chart data from stats
  const classeChartData = stats?.statistiquesParClasse
    ?.filter((c) => c.nombreEleves > 0)
    .map((c) => ({ nom: c.nomClasse, eleves: c.nombreEleves, taux: c.tauxRecouvrement })) || [];

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre établissement">
        <button
          onClick={() => navigate('/eleves/nouveau')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Inscription
        </button>
        <button
          onClick={() => navigate('/finances/paiement')}
          className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
        >
          <Plus size={18} /> Paiement
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Élèves" value={stats?.totalEleves ?? 0} icon={GraduationCap} color="primary" />
            <KpiCard title="Total Familles" value={stats?.totalFamilles ?? 0} icon={Users} color="success" />
            <KpiCard title="Encaissements" value={stats?.totalEncaisse ?? 0} icon={Banknote} color="warning" isCurrency />
            <KpiCard title="Impayés" value={stats?.soldeGlobal ?? 0} icon={AlertTriangle} color="destructive" isCurrency />
          </>
        )}
      </div>

      {/* Taux de recouvrement + Classes chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Effectifs par classe</h3>
          {classeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="nom" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="eleves" fill="hsl(217,91%,60%)" radius={[6, 6, 0, 0]} name="Élèves" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucune donnée de classe disponible</div>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Résumé financier</h3>
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Frais attendus</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(stats?.totalFraisAttendus ?? 0)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total encaissé</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(stats?.totalEncaisse ?? 0)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Solde impayé</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(stats?.soldeGlobal ?? 0)}</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Taux de recouvrement</p>
              <p className="text-lg font-bold text-primary">{stats?.tauxRecouvrement ?? 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Familles Impayées Table */}
      <div className="bg-card rounded-xl border shadow-sm p-5">
        <h3 className="font-semibold text-foreground mb-4">Familles impayées</h3>
        {impayesLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : !impayes?.length ? (
          <EmptyState title="Aucune famille impayée" description="Toutes les familles sont à jour" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Famille</th>
                  <th className="pb-3 font-medium text-muted-foreground">Enfants</th>
                  <th className="pb-3 font-medium text-muted-foreground">Montant dû</th>
                  <th className="pb-3 font-medium text-muted-foreground">Statut</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {impayes.slice(0, 10).map((f) => (
                  <tr key={f.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium">{f.nomPere} {f.prenomPere}</td>
                    <td className="py-3">{f.nombreEnfants}</td>
                    <td className="py-3">{formatCurrency(f.totalDu)}</td>
                    <td className="py-3"><PaymentStatusBadge status={f.statutPaiement} /></td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/familles/${f.id}`)}
                        className="text-primary text-sm hover:underline"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
