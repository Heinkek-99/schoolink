import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { SearchBar } from '@/components/shared/SearchBar';
import { SortableTableHeader, toggleSort, sortData, type SortState } from '@/components/shared/SortableTableHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useEleves } from '@/hooks/useEleves';
import { useFamilles } from '@/hooks/useFamilles';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { Banknote, AlertTriangle, TrendingUp, Plus, GraduationCap, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancesPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: eleves, isLoading: isLoadingEleves } = useEleves();
  const { data: familles } = useFamilles();
  const { canCreate, canView } = usePermissions();

  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });

  const classeChartData = useMemo(() =>
    stats?.statistiquesParClasse
      ?.filter((c) => c.nombreEleves > 0)
      .map((c) => ({ nom: c.nomClasse, taux: c.tauxRecouvrement })) || [],
    [stats]
  );

  // Map "Nom Prénom" -> familleId pour navigation rapide
  const familleIdMap = useMemo(() => {
    const map: Record<string, string> = {};
    familles?.forEach((f) => {
      const key = `${f.nomPere} ${f.prenomPere}`.trim();
      map[key] = f.id;
    });
    return map;
  }, [familles]);

  const filteredEleves = useMemo(() => {
    const list = eleves?.filter((e) => {
      const matchSearch = !search ||
        `${e.nom} ${e.prenom} ${e.matricule} ${e.classe} ${e.famille}`
          .toLowerCase().includes(search.toLowerCase());
      const matchStatut = !statutFilter || e.statut === statutFilter;
      return matchSearch && matchStatut;
    }) ?? [];
    return sortData(list, sort, (item, key) => {
      switch (key) {
        case 'nom': return `${item.prenom} ${item.nom}`;
        case 'matricule': return item.matricule;
        case 'classe': return item.classe;
        case 'famille': return item.famille;
        case 'solde': return item.solde;
        case 'statut': return item.statut;
        default: return '';
      }
    });
  }, [eleves, search, statutFilter, sort]);

  const getSoldeColor = (solde: number) => {
    if (solde < 0) return 'text-red-600 font-semibold';
    if (solde === 0) return 'text-amber-600 font-semibold';
    return 'text-emerald-600 font-semibold';
  };

  const handleFamilleClick = (e: React.MouseEvent, famille: string) => {
    e.stopPropagation();
    const familleId = familleIdMap[famille];
    if (familleId) navigate(`/familles/${familleId}`);
  };

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
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

      {/* Bar Chart */}
      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <div className="mb-5">
          <h3 className="font-semibold text-foreground mb-1">Taux de recouvrement par classe</h3>
          <p className="text-xs text-muted-foreground">Pourcentage de recouvrement par classe</p>
        </div>
        {classeChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
              <XAxis dataKey="nom" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Taux']}
                contentStyle={{ borderRadius: '12px', fontSize: '13px' }}
              />
              <Bar dataKey="taux" fill="hsl(152,69%,41%)" radius={[6, 6, 0, 0]} name="Taux %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">Aucune donnée disponible</div>
        )}
      </div>

      {/* Tableau suivi financier élèves */}
      {canView('finances') && (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                Suivi financier par élève
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cliquez sur le nom de la famille pour accéder à son dossier financier
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <SearchBar placeholder="Rechercher élève, classe, famille..." onSearch={setSearch} />
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="px-3.5 py-2.5 border rounded-xl bg-card text-sm text-foreground outline-none shadow-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Tous les statuts</option>
                <option value="Payé">À jour</option>
                <option value="Partiel">Partiel</option>
                <option value="Impayé">Impayé</option>
              </select>
            </div>
          </div>

          {isLoadingEleves ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : !filteredEleves.length ? (
            <div className="p-6">
              <EmptyState icon={<GraduationCap size={48} strokeWidth={1} />} title="Aucun élève trouvé" />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="data-table">
                <thead>
                  <tr>
                    <SortableTableHeader label="Matricule" sortKey="matricule" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                    <SortableTableHeader label="Élève" sortKey="nom" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                    <SortableTableHeader label="Classe" sortKey="classe" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                    <SortableTableHeader label="Famille" sortKey="famille" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                    <SortableTableHeader label="Solde" sortKey="solde" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                    <SortableTableHeader label="Statut" sortKey="statut" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                    <th className="text-right">Élève</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEleves.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                      <td>
                        <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">
                          {e.matricule}
                        </span>
                      </td>
                      <td className="font-medium">{e.prenom} {e.nom}</td>
                      <td className="text-muted-foreground">{e.classe || '-'}</td>
                      <td>
                        {e.famille ? (
                          <button
                            onClick={(ev) => handleFamilleClick(ev, e.famille)}
                            className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline text-sm font-medium transition-colors"
                            title="Voir le dossier de la famille"
                          >
                            {e.famille}
                            <ExternalLink size={12} />
                          </button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className={getSoldeColor(e.solde)}>{formatCurrency(e.solde)}</td>
                      <td><PaymentStatusBadge status={e.statut} /></td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/eleves/${e.id}`)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredEleves.length > 0 && (
            <div className="px-5 py-3 border-t bg-muted/30 flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
              <span>{filteredEleves.length} élève(s) affichés</span>
              <span className="text-red-600 font-medium">
                Impayés : {filteredEleves.filter(e => e.statut === 'Impayé').length}
              </span>
              <span className="text-amber-600 font-medium">
                Partiels : {filteredEleves.filter(e => e.statut === 'Partiel').length}
              </span>
              <span className="text-emerald-600 font-medium">
                À jour : {filteredEleves.filter(e => e.statut === 'Payé' || e.statut === 'À jour').length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}