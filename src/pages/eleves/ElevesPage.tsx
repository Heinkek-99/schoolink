import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEleves, useClasses } from '@/hooks/useEleves';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ElevesPage() {
  const navigate = useNavigate();
  const { data: eleves, isLoading } = useEleves();
  const { data: classes } = useClasses();
  const [search, setSearch] = useState('');
  const [classeFilter, setClasseFilter] = useState('');

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = eleves?.filter((e) => {
    const matchSearch = !search || `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase());
    const matchClasse = !classeFilter || e.classe === classeFilter;
    return matchSearch && matchClasse;
  });

  return (
    <div>
      <PageHeader title="Élèves" subtitle={`${eleves?.length ?? 0} élèves inscrits`}>
        <button
          onClick={() => navigate('/eleves/nouveau')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Nouvelle inscription
        </button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar placeholder="Rechercher un élève..." onSearch={handleSearch} />
        <select
          value={classeFilter}
          onChange={(e) => setClasseFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-card text-sm text-foreground outline-none"
        >
          <option value="">Toutes les classes</option>
          {classes?.map((c) => (
            <option key={c.id} value={c.nom}>{c.nom}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border shadow-sm p-5"><TableSkeleton /></div>
      ) : !filtered?.length ? (
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <EmptyState icon={<GraduationCap size={48} strokeWidth={1} />} title="Aucun élève trouvé" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Matricule</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Nom complet</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Classe</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Famille</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-4"><span className="status-badge-active font-mono">{e.matricule}</span></td>
                    <td className="p-4 font-medium">{e.prenom} {e.nom}</td>
                    <td className="p-4">{e.classe || '-'}</td>
                    <td className="p-4">{e.famille || '-'}</td>
                    <td className="p-4">{formatCurrency(e.solde)}</td>
                    <td className="p-4"><PaymentStatusBadge status={e.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
