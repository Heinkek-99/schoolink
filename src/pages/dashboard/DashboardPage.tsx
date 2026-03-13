import { Users, GraduationCap, Banknote, AlertTriangle, Plus, BookOpen, Clock, Bell, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDashboardStats, useFamillesImpayes } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { useEleves } from '@/hooks/useEleves';
import { formatCurrency } from '@/utils/formatCurrency';

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(152, 69%, 41%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(270, 50%, 60%)',
  'hsl(199, 89%, 48%)',
];

function FinanceDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: impayes, isLoading: impayesLoading } = useFamillesImpayes();
  const { canCreate } = usePermissions();

  const classeChartData = stats?.statistiquesParClasse
    ?.filter((c) => c.nombreEleves > 0)
    .map((c) => ({ nom: c.nomClasse, eleves: c.nombreEleves, taux: c.tauxRecouvrement })) || [];

  const pieData = [
    { name: 'Encaissé', value: stats?.totalEncaisse ?? 0 },
    { name: 'Impayé', value: stats?.soldeGlobal ?? 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre établissement">
        {canCreate('eleves') && (
          <button
            onClick={() => navigate('/eleves/nouveau')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={18} /> Inscription
          </button>
        )}
        {canCreate('paiements') && (
          <button
            onClick={() => navigate('/finances/paiement')}
            className="flex items-center gap-2 px-4 py-2.5 bg-success text-success-foreground rounded-xl text-sm font-semibold hover:bg-success/90 transition-colors shadow-sm"
          >
            <Plus size={18} /> Paiement
          </button>
        )}
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Effectifs par classe</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Répartition des élèves</p>
            </div>
          </div>
          {classeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classeChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                <XAxis dataKey="nom" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(220, 13%, 91%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="eleves" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} name="Élèves" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">Aucune donnée de classe disponible</div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-5">Résumé financier</h3>
          <div className="space-y-3">
            <div className="p-4 bg-muted/40 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frais attendus</p>
              <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(stats?.totalFraisAttendus ?? 0)}</p>
            </div>
            <div className="p-4 bg-success/5 rounded-xl border border-success/10">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total encaissé</p>
              <p className="text-xl font-bold text-success mt-1">{formatCurrency(stats?.totalEncaisse ?? 0)}</p>
            </div>
            <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Solde impayé</p>
              <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(stats?.soldeGlobal ?? 0)}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Taux de recouvrement</p>
                  <p className="text-xl font-bold text-primary mt-1">{stats?.tauxRecouvrement ?? 0}%</p>
                </div>
                <TrendingUp size={28} className="text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Familles Impayées Table */}
      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h3 className="font-semibold text-foreground">Top familles impayées</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Familles avec les soldes les plus élevés</p>
          </div>
          <button onClick={() => navigate('/familles')} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </button>
        </div>
        <div className="p-6 pt-4">
          {impayesLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : !impayes?.length ? (
            <EmptyState title="Aucune famille impayée" description="Toutes les familles sont à jour" />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Famille</th>
                    <th>Enfants</th>
                    <th>Montant dû</th>
                    <th>Solde restant</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {impayes.slice(0, 10).map((f) => (
                    <tr key={f.familleId} className="cursor-pointer" onClick={() => navigate(`/familles/${f.familleId}`)}>
                      <td className="font-medium">{f.nomFamille}</td>
                      <td>{f.nombreEnfants}</td>
                      <td>{formatCurrency(f.montantDu)}</td>
                      <td className="font-semibold text-destructive">{formatCurrency(f.soldeRestant)}</td>
                      <td><PaymentStatusBadge status={f.niveauPriorite} /></td>
                      <td><PaymentStatusBadge status={f.statutImpaie} /></td>
                      <td>
                        <button className="text-primary text-sm hover:underline font-medium">Détails</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SecretaireDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: eleves, isLoading: elevesLoading } = useEleves();

  const classeChartData = stats?.statistiquesParClasse
    ?.filter((c) => c.nombreEleves > 0)
    .map((c) => ({ nom: c.nomClasse, eleves: c.nombreEleves })) || [];

  const totalClasses = stats?.statistiquesParClasse?.length ?? 0;
  const recentEleves = eleves?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" subtitle="Gestion des inscriptions et effectifs">
        <button
          onClick={() => navigate('/eleves/nouveau')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={18} /> Nouvelle inscription
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Élèves" value={stats?.totalEleves ?? 0} icon={GraduationCap} color="primary" />
            <KpiCard title="Total Familles" value={stats?.totalFamilles ?? 0} icon={Users} color="success" />
            <KpiCard title="Classes" value={totalClasses} icon={BookOpen} color="warning" />
            <KpiCard title="Taux occupation" value={`${Math.round(((stats?.totalEleves ?? 0) / Math.max(totalClasses * 60, 1)) * 100)}%`} icon={Bell} color="info" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Répartition par classe</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Nombre d'élèves par classe</p>
            </div>
          </div>
          {classeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classeChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                <XAxis dataKey="nom" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(220, 13%, 91%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="eleves" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} name="Élèves" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">Aucune donnée de classe disponible</div>
          )}
        </div>

        {/* Classes overview */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4">Aperçu des classes</h3>
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto">
            {stats?.statistiquesParClasse?.map((c, i) => (
              <div key={c.nomClasse} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-sm font-medium">{c.nomClasse}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.nombreEleves}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((c.nombreEleves / 60) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {!stats?.statistiquesParClasse?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune classe</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">Dernières inscriptions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">5 derniers élèves inscrits</p>
            </div>
          </div>
          <button onClick={() => navigate('/eleves')} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Voir tous <ArrowRight size={14} />
          </button>
        </div>
        <div className="p-6 pt-4">
          {elevesLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : !recentEleves.length ? (
            <EmptyState title="Aucun élève inscrit" description="Commencez par inscrire un élève" />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Famille</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEleves.map((e) => (
                    <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="cursor-pointer">
                      <td><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">{e.matricule}</span></td>
                      <td className="font-medium">{e.prenom} {e.nom}</td>
                      <td>{e.classe}</td>
                      <td className="text-muted-foreground">{e.famille}</td>
                      <td><PaymentStatusBadge status={e.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role } = usePermissions();

  if (role === 'Secretaire') {
    return <SecretaireDashboard />;
  }

  return <FinanceDashboard />;
}
