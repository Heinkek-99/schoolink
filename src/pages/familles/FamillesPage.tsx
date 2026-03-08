import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useFamilles, useCreateFamille, useDeleteFamille } from '@/hooks/useFamilles';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotificationStore } from '@/store/notificationStore';
import type { Famille } from '@/types/famille.types';

const familleSchema = z.object({
  nomPere: z.string().min(1, 'Nom du père requis'),
  prenomPere: z.string().default(''),
  telephonePrincipal: z.string().min(1, 'Téléphone requis'),
  emailPere: z.string().email('Email invalide').optional().or(z.literal('')),
  nomMere: z.string().optional(),
  prenomMere: z.string().optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
});

type FamilleForm = z.infer<typeof familleSchema>;

function ActionMenu({ famille, onEdit, onDelete, canEdit, canDelete }: {
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
        <div className="absolute right-0 top-full mt-1 w-44 bg-card border rounded-lg shadow-lg z-20 py-1 animate-fade-in">
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
  const { data: familles, isLoading } = useFamilles();
  const createMutation = useCreateFamille();
  const deleteMutation = useDeleteFamille();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFamille, setEditingFamille] = useState<Famille | null>(null);
  const [deletingFamille, setDeletingFamille] = useState<Famille | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FamilleForm>({
    resolver: zodResolver(familleSchema),
  });

  const editForm = useForm<FamilleForm>({
    resolver: zodResolver(familleSchema),
  });

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = familles?.filter((f) => {
    const matchSearch = !search || `${f.nomPere} ${f.prenomPere}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || f.statutPaiement === statusFilter;
    return matchSearch && matchStatus;
  });

  const onSubmit = (data: FamilleForm) => {
    createMutation.mutate(data as any, {
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
    <div>
      <PageHeader title="Familles" subtitle={`${familles?.length ?? 0} familles enregistrées`}>
        {canCreate('familles') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Nouvelle famille
          </button>
        )}
      </PageHeader>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar placeholder="Rechercher une famille..." onSearch={handleSearch} />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-card text-sm text-foreground outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="Payé">À jour</option>
          <option value="Partiel">Partiel</option>
          <option value="Impayé">Impayé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border shadow-sm p-5"><TableSkeleton /></div>
      ) : !filtered?.length ? (
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <EmptyState icon={<Users size={48} strokeWidth={1} />} title="Aucune famille trouvée" description="Créez une nouvelle famille pour commencer" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Famille</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Nb enfants</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Total dû</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Total payé</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((f) => (
                  <tr key={f.id} onClick={() => navigate(`/familles/${f.id}`)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-4 font-medium">{f.nomPere} {f.prenomPere}</td>
                    <td className="p-4">{f.nombreEnfants}</td>
                    <td className="p-4">{formatCurrency(f.totalDu)}</td>
                    <td className="p-4">{formatCurrency(f.totalPaye)}</td>
                    <td className="p-4 font-medium">{formatCurrency(f.soldeGlobal)}</td>
                    <td className="p-4"><PaymentStatusBadge status={f.statutPaiement} /></td>
                    <td className="p-4">
                      <ActionMenu
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

      {/* Delete confirmation */}
      {deletingFamille && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setDeletingFamille(null)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-destructive mb-2">Supprimer cette famille ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La famille <strong>{deletingFamille.nomPere} {deletingFamille.prenomPere}</strong>
              {deletingFamille.nombreEnfants > 0 && ` et ses ${deletingFamille.nombreEnfants} enfant(s)`} sera définitivement supprimée.
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingFamille(null)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-lg p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Nouvelle famille</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom du père *</label>
                  <input {...register('nomPere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.nomPere && <p className="text-xs text-destructive mt-1">{errors.nomPere.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom du père</label>
                  <input {...register('prenomPere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Téléphone principal *</label>
                <input {...register('telephonePrincipal')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                {errors.telephonePrincipal && <p className="text-xs text-destructive mt-1">{errors.telephonePrincipal.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input {...register('emailPere')} type="email" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom de la mère</label>
                  <input {...register('nomMere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom de la mère</label>
                  <input {...register('prenomMere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Adresse</label>
                  <input {...register('adresse')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ville</label>
                  <input {...register('ville')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
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
