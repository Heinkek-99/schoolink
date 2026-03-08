import { Users, GraduationCap, Banknote, AlertTriangle, Plus, BookOpen, Clock, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDashboardStats, useFamillesImpayes } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { useEleves } from '@/hooks/useEleves';
import { formatCurrency } from '@/utils/formatCurrency';

function FinanceDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: impayes, isLoading: impayesLoading } = useFamillesImpayes();
  const { canCreate } = usePermissions();

  const classeChartData = stats?.statistiquesParClasse
    ?.filter((c) => c.nombreEleves > 0)
    .map((c) => ({ nom: c.nomClasse, eleves: c.nombreEleves, taux: c.tauxRecouvrement })) || [];

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre établissement">
        {canCreate('eleves') && (
          <button
            onClick={() => navigate('/eleves/nouveau')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Inscription
          </button>
        )}
        {canCreate('paiements') && (
          <button
            onClick={() => navigate('/finances/paiement')}
            className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
          >
            <Plus size={18} /> Paiement
          </button>
        )}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Effectifs par classe</h3>
          {classeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="nom" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="eleves" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Élèves" />
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
            <div className="p-3 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total encaissé</p>
              <p className="text-lg font-bold text-success">{formatCurrency(stats?.totalEncaisse ?? 0)}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Solde impayé</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(stats?.soldeGlobal ?? 0)}</p>
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
        <h3 className="font-semibold text-foreground mb-4">Top familles impayées</h3>
        {impayesLoading ? (
          <TableSkeleton rows={5} cols={6} />
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
                  <th className="pb-3 font-medium text-muted-foreground">Solde restant</th>
                  <th className="pb-3 font-medium text-muted-foreground">Priorité</th>
                  <th className="pb-3 font-medium text-muted-foreground">Statut</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {impayes.slice(0, 10).map((f) => (
                  <tr key={f.familleId} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium">{f.nomFamille}</td>
                    <td className="py-3">{f.nombreEnfants}</td>
                    <td className="py-3">{formatCurrency(f.montantDu)}</td>
                    <td className="py-3 font-medium text-destructive">{formatCurrency(f.soldeRestant)}</td>
                    <td className="py-3"><PaymentStatusBadge status={f.niveauPriorite} /></td>
                    <td className="py-3"><PaymentStatusBadge status={f.statutImpaie} /></td>
                    <td className="py-3">
                      <button onClick={() => navigate(`/familles/${f.familleId}`)} className="text-primary text-sm hover:underline">
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

function SecretaireDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: eleves, isLoading: elevesLoading } = useEleves();

  const classeChartData = stats?.statistiquesParClasse
    ?.filter((c) => c.nombreEleves > 0)
    .map((c) => ({ nom: c.nomClasse, eleves: c.nombreEleves })) || [];

  const totalClasses = stats?.statistiquesParClasse?.length ?? 0;

  // Last 5 enrolled students (by list order, most recent first)
  const recentEleves = eleves?.slice(0, 5) || [];

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Gestion des inscriptions et effectifs">
        <button
          onClick={() => navigate('/eleves/nouveau')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Nouvelle inscription
        </button>
      </PageHeader>

      {/* KPI Cards — effectifs uniquement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Élèves" value={stats?.totalEleves ?? 0} icon={GraduationCap} color="primary" />
            <KpiCard title="Total Familles" value={stats?.totalFamilles ?? 0} icon={Users} color="success" />
            <KpiCard title="Classes" value={totalClasses} icon={BookOpen} color="warning" />
            <KpiCard title="Taux occupation" value={`${Math.round(((stats?.totalEleves ?? 0) / Math.max(totalClasses * 60, 1)) * 100)}%`} icon={Bell} color="primary" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Répartition par classe */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Répartition par classe</h3>
          {classeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="nom" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="eleves" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Élèves" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucune donnée de classe disponible</div>
          )}
        </div>

        {/* Aperçu classes */}
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Aperçu des classes</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {stats?.statistiquesParClasse?.map((c) => (
              <div key={c.nomClasse} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">{c.nomClasse}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{c.nombreEleves} élèves</span>
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

      {/* Dernières inscriptions */}
      <div className="bg-card rounded-xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock size={18} className="text-muted-foreground" /> Dernières inscriptions
          </h3>
          <button onClick={() => navigate('/eleves')} className="text-sm text-primary hover:underline">
            Voir tous les élèves
          </button>
        </div>
        {elevesLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : !recentEleves.length ? (
          <EmptyState title="Aucun élève inscrit" description="Commencez par inscrire un élève" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Matricule</th>
                  <th className="pb-3 font-medium text-muted-foreground">Élève</th>
                  <th className="pb-3 font-medium text-muted-foreground">Classe</th>
                  <th className="pb-3 font-medium text-muted-foreground">Famille</th>
                  <th className="pb-3 font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentEleves.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <td className="py-3"><span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{e.matricule}</span></td>
                    <td className="py-3 font-medium">{e.prenom} {e.nom}</td>
                    <td className="py-3">{e.classe}</td>
                    <td className="py-3 text-muted-foreground">{e.famille}</td>
                    <td className="py-3"><PaymentStatusBadge status={e.statut} /></td>
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

export default function DashboardPage() {
  const { role, canView } = usePermissions();

  // Secrétaire : dashboard sans finances
  if (role === 'Secretaire') {
    return <SecretaireDashboard />;
  }

  // Admin, Directeur, Comptable : dashboard financier complet
  return <FinanceDashboard />;
}
