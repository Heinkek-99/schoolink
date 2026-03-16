import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, MoreVertical, Pencil, Trash2, Eye, AlertTriangle, Banknote, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import { SortableTableHeader, toggleSort, sortData, type SortState } from '@/components/shared/SortableTableHeader';
import { useFamilles, useCreateFamille, useDeleteFamille } from '@/hooks/useFamilles';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotificationStore } from '@/store/notificationStore';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionBar } from '@/components/shared/BulkActionBar';
import type { Famille } from '@/types/famille.types';
import { useRef } from 'react';

const familleSchema = z.object({
  nomPere: z.string().min(1, 'Nom du père requis'),
  prenomPere: z.string().default(''),
  telephonePrincipal: z.string().min(1, 'Téléphone principal requis'),
  telephonePere: z.string().optional(),
  emailPere: z.string().email('Email invalide').optional().or(z.literal('')),
  nomMere: z.string().optional(),
  prenomMere: z.string().optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
});

type FamilleForm = z.infer<typeof familleSchema>;

function FamilleActionMenu({ famille, onEdit, onDelete, canEdit, canDelete }: {
  famille: Famille;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-card border rounded-xl shadow-lg z-20 py-1 animate-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(`/familles/${famille.id}`); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
          >
            <Eye size={14} /> Voir détails
          </button>
          {canEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <Pencil size={14} /> Modifier
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FamillesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: familles, isLoading } = useFamilles(debouncedSearch || undefined);
  const createMutation = useCreateFamille();
  const deleteMutation = useDeleteFamille();
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deletingFamille, setDeletingFamille] = useState<Famille | null>(null);
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FamilleForm>({
    resolver: zodResolver(familleSchema),
  });

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = useMemo(() => {
    const list = statusFilter ? familles?.filter((f) => f.statutPaiement === statusFilter) ?? [] : familles ?? [];
    return sortData(list, sort, (item, key) => {
      switch (key) {
        case 'nom': return `${item.nomPere} ${item.prenomPere}`;
        case 'telephone': return item.telephonePrincipal;
        case 'enfants': return item.nombreEnfants;
        case 'totalDu': return item.totalDu;
        case 'solde': return item.soldeGlobal;
        case 'statut': return item.statutPaiement;
        default: return '';
      }
    });
  }, [familles, statusFilter, sort]);

  // KPI computations
  // soldeGlobal < 0 = la famille doit de l'argent (convention dette négative)
  // fallback sur statutPaiement si soldeGlobal est mal renvoyé par l'API
  const kpis = useMemo(() => {
    const list = familles ?? [];
    const total = list.length;
    const impayees = list.filter(f =>
      f.soldeGlobal < 0 || f.statutPaiement === 'Impayé' || f.statutPaiement === 'Partiel'
    ).length;
    const totalImpaye = list.reduce((sum, f) => {
      // Si soldeGlobal < 0 : dette = valeur absolue. Si >= 0 : à jour.
      const dette = f.soldeGlobal < 0 ? Math.abs(f.soldeGlobal) : 0;
      return sum + dette;
    }, 0);
    return { total, impayees, totalImpaye };
  }, [familles]);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(f => f.id)));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onSubmit = (data: FamilleForm) => {
    const cleanData: Record<string, any> = {
      nomPere: data.nomPere,
      telephonePrincipal: data.telephonePrincipal,
    };
    if (data.prenomPere) cleanData.prenomPere = data.prenomPere;
    if (data.telephonePere) cleanData.telephonePere = data.telephonePere;
    if (data.emailPere) cleanData.emailPere = data.emailPere;
    if (data.nomMere) cleanData.nomMere = data.nomMere;
    if (data.prenomMere) cleanData.prenomMere = data.prenomMere;
    if (data.adresse) cleanData.adresse = data.adresse;
    if (data.ville) cleanData.ville = data.ville;

    createMutation.mutate(cleanData as any, {
      onSuccess: () => {
        addNotification({ type: 'info', title: 'Nouvelle famille', message: `Famille ${data.nomPere} créée avec succès` });
        setShowModal(false);
        reset();
      },
    });
  };

  const handleEdit = (famille: Famille) => {
    navigate(`/familles/${famille.id}`);
  };

  const handleDeleteConfirm = () => {
    if (!deletingFamille) return;
    deleteMutation.mutate(deletingFamille.id, {
      onSuccess: () => {
        addNotification({ type: 'info', title: 'Famille supprimée', message: `${deletingFamille.nomPere} ${deletingFamille.prenomPere} supprimée` });
        setDeletingFamille(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Familles" subtitle={`${familles?.length ?? 0} familles enregistrées`}>
        {canCreate('familles') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Nouvelle famille
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Familles actives" value={kpis.total} icon={UserCheck} color="primary" tooltipContent="Nombre total de familles enregistrées" />
            <KpiCard title="Familles impayées" value={kpis.impayees} icon={AlertTriangle} color="warning" tooltipContent={`${kpis.impayees} familles avec solde négatif`} />
            <KpiCard title="Total impayé" value={kpis.totalImpaye} icon={Banknote} isCurrency color="destructive" tooltipContent="Montant total des soldes négatifs" />
          </>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Rechercher une famille..." onSearch={handleSearch} />
        {canView('finances') && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 border rounded-xl bg-card text-sm text-foreground outline-none shadow-sm focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tous les statuts</option>
            <option value="Payé">À jour</option>
            <option value="Partiel">Partiel</option>
            <option value="Impayé">Impayé</option>
          </select>
        )}
        {selectedIds.size > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">{selectedIds.size} sélectionnée(s)</span>
        )}
      </div>

      {isLoading ? (
        <div className="bg-card rounded-2xl border shadow-sm p-6"><TableSkeleton /></div>
      ) : !filtered.length ? (
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <EmptyState icon={<Users size={48} strokeWidth={1} />} title="Aucune famille trouvée" description="Créez une nouvelle famille pour commencer" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} onClick={(e) => e.stopPropagation()} />
                  </th>
                  <SortableTableHeader label="Famille" sortKey="nom" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  <SortableTableHeader label="Téléphone" sortKey="telephone" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  <SortableTableHeader label="Nb enfants" sortKey="enfants" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  {canView('finances') && <SortableTableHeader label="Total dû" sortKey="totalDu" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />}
                  {canView('finances') && <SortableTableHeader label="Solde" sortKey="solde" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />}
                  {canView('finances') && <SortableTableHeader label="Statut" sortKey="statut" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} onClick={() => navigate(`/familles/${f.id}`)} className="cursor-pointer">
                    <td>
                      <Checkbox
                        checked={selectedIds.has(f.id)}
                        onCheckedChange={() => toggleSelect(f.id)}
                        onClick={(ev) => ev.stopPropagation()}
                      />
                    </td>
                    <td className="font-medium">{f.nomPere} {f.prenomPere}</td>
                    <td className="text-muted-foreground">{f.telephonePrincipal}</td>
                    <td>
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">{f.nombreEnfants}</span>
                    </td>
                    {canView('finances') && <td>{formatCurrency(f.totalDu)}</td>}
                    {canView('finances') && <td className="font-semibold">{formatCurrency(f.soldeGlobal)}</td>}
                    {canView('finances') && <td><PaymentStatusBadge status={f.statutPaiement} /></td>}
                    <td>
                      <FamilleActionMenu
                        famille={f}
                        onEdit={() => handleEdit(f)}
                        onDelete={() => setDeletingFamille(f)}
                        canEdit={canEdit('familles')}
                        canDelete={canDelete('familles')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deletingFamille}
        onOpenChange={(open) => { if (!open) setDeletingFamille(null); }}
        description={`La famille ${deletingFamille?.nomPere ?? ''} ${deletingFamille?.prenomPere ?? ''}${deletingFamille && deletingFamille.nombreEnfants > 0 ? ` et ses ${deletingFamille.nombreEnfants} enfant(s)` : ''} sera définitivement supprimée.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-5">Nouvelle famille</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom du père *</label>
                  <input {...register('nomPere')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                  {errors.nomPere && <p className="text-xs text-destructive mt-1">{errors.nomPere.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Prénom du père</label>
                  <input {...register('prenomPere')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Téléphone principal *</label>
                  <input {...register('telephonePrincipal')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                  {errors.telephonePrincipal && <p className="text-xs text-destructive mt-1">{errors.telephonePrincipal.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Téléphone du père</label>
                  <input {...register('telephonePere')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input {...register('emailPere')} type="email" className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom de la mère</label>
                  <input {...register('nomMere')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Prénom de la mère</label>
                  <input {...register('prenomMere')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Adresse</label>
                  <input {...register('adresse')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ville</label>
                  <input {...register('ville')} className="w-full px-3.5 py-2.5 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}