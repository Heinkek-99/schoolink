import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, MoreVertical, Eye, Pencil, Trash2, Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEleves, useClasses, useDeleteEleve } from '@/hooks/useEleves';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Eleve } from '@/types/eleve.types';

function ActionMenu({ eleve, canEdit, canDelete }: {
  eleve: Eleve;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const deleteMutation = useDeleteEleve();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowConfirm(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = () => {
    deleteMutation.mutate(eleve.id, {
      onSuccess: () => setShowConfirm(false),
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <MoreVertical size={16} />
      </button>
      {open && !showConfirm && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-card border rounded-lg shadow-lg z-20 py-1 animate-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(`/eleves/${eleve.id}`); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
          >
            <Eye size={14} /> Voir détails
          </button>
          {canEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(`/eleves/${eleve.id}`); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <Pencil size={14} /> Modifier
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          )}
        </div>
      )}
      {showConfirm && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-card border rounded-lg shadow-lg z-20 p-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm font-medium mb-1">Supprimer cet élève ?</p>
          <p className="text-xs text-muted-foreground mb-3">Cette action est irréversible.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)} className="flex-1 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors">
              {deleteMutation.isPending ? '...' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ElevesPage() {
  const navigate = useNavigate();
  const { data: eleves, isLoading } = useEleves();
  const { data: classes } = useClasses();
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
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
        {canCreate('eleves') && (
          <button
            onClick={() => navigate('/eleves/nouveau')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Nouvelle inscription
          </button>
        )}
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
                  {canView('finances') && <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>}
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-4"><span className="status-badge-active font-mono">{e.matricule}</span></td>
                    <td className="p-4 font-medium">{e.prenom} {e.nom}</td>
                    <td className="p-4">{e.classe || '-'}</td>
                    <td className="p-4">{e.famille || '-'}</td>
                    {canView('finances') && <td className="p-4">{formatCurrency(e.solde)}</td>}
                    <td className="p-4"><PaymentStatusBadge status={e.statut} /></td>
                    <td className="p-4 text-right">
                      <ActionMenu eleve={e} canEdit={canEdit('eleves')} canDelete={canDelete('eleves')} />
                    </td>
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
