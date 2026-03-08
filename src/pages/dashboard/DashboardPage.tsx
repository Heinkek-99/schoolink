import { Users, GraduationCap, Banknote, AlertTriangle, Plus, TrendingUp, TrendingDown } from 'lucide-react';
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

// Mock chart data (replace with API when available)
const encaissementsMock = [
  { mois: 'Oct', montant: 4500000 },
  { mois: 'Nov', montant: 3800000 },
  { mois: 'Déc', montant: 5200000 },
  { mois: 'Jan', montant: 6100000 },
  { mois: 'Fév', montant: 4900000 },
  { mois: 'Mar', montant: 5800000 },
];

const repartitionMock = [
  { statut: 'À jour', nombre: 120, pourcentage: 45 },
  { statut: 'Partiel', nombre: 85, pourcentage: 32 },
  { statut: 'Impayé', nombre: 60, pourcentage: 23 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: impayes, isLoading: impayesLoading } = useFamillesImpayes();

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
            <KpiCard title="Total Élèves" value={stats?.totalEleves ?? 0} icon={GraduationCap} color="primary" trend="+12 ce mois" trendUp />
            <KpiCard title="Total Familles" value={stats?.totalFamilles ?? 0} icon={Users} color="success" />
            <KpiCard title="Encaissements" value={stats?.totalEncaissements ?? 0} icon={Banknote} color="warning" isCurrency trend={`Taux: ${stats?.tauxRecouvrement ?? 0}%`} trendUp />
            <KpiCard title="Impayés" value={stats?.totalImpayes ?? 0} icon={AlertTriangle} color="destructive" isCurrency />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Encaissements - 6 derniers mois</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={encaissementsMock}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="mois" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="montant" fill="hsl(217,91%,60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Répartition des statuts</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={repartitionMock} dataKey="nombre" nameKey="statut" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                {repartitionMock.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {repartitionMock.map((item, i) => (
              <div key={item.statut} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{item.statut}</span>
                </div>
                <span className="font-medium">{item.pourcentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Familles Impayées Table */}
      <div className="bg-card rounded-xl border shadow-sm p-5">
        <h3 className="font-semibold text-foreground mb-4">Top 10 familles impayées</h3>
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
                    <td className="py-3 font-medium">{f.nom}</td>
                    <td className="py-3">{f.nombreEnfants}</td>
                    <td className="py-3">{formatCurrency(f.montantDu)}</td>
                    <td className="py-3"><PaymentStatusBadge due={f.montantDu} paid={0} status={f.statut} /></td>
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
