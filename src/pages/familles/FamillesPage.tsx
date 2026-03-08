import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useFamilles, useCreateFamille } from '@/hooks/useFamilles';
import { formatCurrency } from '@/utils/formatCurrency';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const familleSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prénom requis').max(100),
  telephone: z.string().min(1, 'Téléphone requis').max(20),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
});

type FamilleForm = z.infer<typeof familleSchema>;

export default function FamillesPage() {
  const navigate = useNavigate();
  const { data: familles, isLoading } = useFamilles();
  const createMutation = useCreateFamille();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FamilleForm>({
    resolver: zodResolver(familleSchema),
  });

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = familles?.filter((f) => {
    const matchSearch = !search || `${f.nom} ${f.prenom}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || f.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const onSubmit = (data: FamilleForm) => {
    createMutation.mutate({ nom: data.nom, prenom: data.prenom, telephone: data.telephone, email: data.email, adresse: data.adresse, ville: data.ville }, {
      onSuccess: () => {
        setShowModal(false);
        reset();
      },
    });
  };

  return (
    <div>
      <PageHeader title="Familles" subtitle={`${familles?.length ?? 0} familles enregistrées`}>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Nouvelle famille
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar placeholder="Rechercher une famille..." onSearch={handleSearch} />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-card text-sm text-foreground outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="À jour">À jour</option>
          <option value="Partiel">Partiel</option>
          <option value="Impayé">Impayé</option>
        </select>
      </div>

      {/* Table */}
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
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => navigate(`/familles/${f.id}`)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-medium">{f.nom} {f.prenom}</td>
                    <td className="p-4">{f.nombreEnfants}</td>
                    <td className="p-4">{formatCurrency(f.totalDu)}</td>
                    <td className="p-4">{formatCurrency(f.totalPaye)}</td>
                    <td className="p-4 font-medium">{formatCurrency(f.solde)}</td>
                    <td className="p-4"><PaymentStatusBadge due={f.totalDu} paid={f.totalPaye} status={f.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Nouvelle famille</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom *</label>
                  <input {...register('nom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.nom && <p className="text-xs text-destructive mt-1">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom *</label>
                  <input {...register('prenom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.prenom && <p className="text-xs text-destructive mt-1">{errors.prenom.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Téléphone *</label>
                <input {...register('telephone')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                {errors.telephone && <p className="text-xs text-destructive mt-1">{errors.telephone.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input {...register('email')} type="email" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ville</label>
                <input {...register('ville')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
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
