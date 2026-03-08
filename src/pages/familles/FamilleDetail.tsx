import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Phone, Mail, MapPin, Save, Trash2, Pencil, Banknote, Percent } from 'lucide-react';
import { useFamille, useUpdateFamille, useDeleteFamille } from '@/hooks/useFamilles';
import { usePaiementsByFamille } from '@/hooks/usePaiements';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getRecoveryRate } from '@/utils/constants';

const editFamilleSchema = z.object({
  nomPere: z.string().min(1, 'Nom requis'),
  prenomPere: z.string().default(''),
  telephonePrincipal: z.string().min(1, 'Téléphone requis'),
  emailPere: z.string().email('Email invalide').optional().or(z.literal('')),
  nomMere: z.string().optional(),
  prenomMere: z.string().optional(),
  telephoneMere: z.string().optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
});

type EditFamilleForm = z.infer<typeof editFamilleSchema>;

export default function FamilleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: famille, isLoading } = useFamille(id!);
  const { data: paiements } = usePaiementsByFamille(id!);
  const updateMutation = useUpdateFamille();
  const deleteMutation = useDeleteFamille();
  const { canEdit, canDelete, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<'enfants' | 'paiements' | 'informations'>('enfants');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const editForm = useForm<EditFamilleForm>({
    resolver: zodResolver(editFamilleSchema),
  });

  const startEditing = () => {
    if (famille) {
      editForm.reset({
        nomPere: famille.nomPere,
        prenomPere: famille.prenomPere || '',
        telephonePrincipal: famille.telephonePrincipal,
        emailPere: famille.emailPere || '',
        nomMere: famille.nomMere || '',
        prenomMere: famille.prenomMere || '',
        telephoneMere: famille.telephoneMere || '',
        adresse: famille.adresse || '',
        ville: famille.ville || '',
      });
    }
    setIsEditing(true);
  };

  const onSave = (data: EditFamilleForm) => {
    updateMutation.mutate(
      { id: id!, ...data } as any,
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => navigate('/familles'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}</div>
      </div>
    );
  }

  if (!famille) {
    return <div className="text-center py-16 text-muted-foreground">Famille non trouvée</div>;
  }

  const tabs = [
    { key: 'enfants' as const, label: 'Enfants' },
    { key: 'paiements' as const, label: 'Paiements' },
    { key: 'informations' as const, label: 'Informations' },
  ];

  return (
    <div>
      <button onClick={() => navigate('/familles')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={18} /> Retour aux familles
      </button>

      <div className="bg-card rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{famille.nomPere} {famille.prenomPere}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {famille.telephonePrincipal && <span className="flex items-center gap-1"><Phone size={14} /> {famille.telephonePrincipal}</span>}
              {famille.emailPere && <span className="flex items-center gap-1"><Mail size={14} /> {famille.emailPere}</span>}
              {famille.ville && <span className="flex items-center gap-1"><MapPin size={14} /> {famille.ville}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit('familles') && (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <Pencil size={16} /> Modifier
              </button>
            )}
            {canDelete('familles') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-destructive/30 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-destructive mb-2">Supprimer cette famille ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La famille <strong>{famille.nomPere} {famille.prenomPere}</strong>
              {famille.enfants?.length > 0 && ` et ses ${famille.enfants.length} enfant(s) associé(s)`} sera définitivement supprimée.
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total dû" value={famille.totalDu} icon={Banknote} isCurrency color="destructive" />
        <KpiCard title="Total payé" value={famille.totalPaye} icon={Banknote} isCurrency color="success" />
        <KpiCard title="Solde" value={famille.soldeGlobal} icon={Banknote} isCurrency color="warning" />
        <KpiCard title="Taux recouvrement" value={getRecoveryRate(famille.totalDu, famille.totalPaye)} icon={Percent} color="primary" />
      </div>

      <div className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key !== 'informations') setIsEditing(false); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'enfants' && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {!famille.enfants?.length ? (
            <div className="p-8 text-center text-muted-foreground">Aucun enfant enregistré</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Matricule</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Élève</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Classe</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {famille.enfants.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-4"><span className="status-badge-active font-mono">{e.matricule}</span></td>
                    <td className="p-4 font-medium">{e.prenom} {e.nom}</td>
                    <td className="p-4">{e.classe}</td>
                    <td className="p-4 font-medium">{formatCurrency(e.solde)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'paiements' && (
        <div className="bg-card rounded-xl border shadow-sm p-5">
          {!paiements?.length ? (
            <div className="text-center text-muted-foreground py-8">Aucun paiement enregistré</div>
          ) : (
            <div className="space-y-4">
              {paiements.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{formatCurrency(p.montant)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(p.date)} · {p.mode}</p>
                    {p.reference && <p className="text-xs text-muted-foreground">Réf: {p.reference}</p>}
                  </div>
                  <span className="status-badge-paid">Validé</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'informations' && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          {isEditing ? (
            <form onSubmit={editForm.handleSubmit(onSave)} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Modifier les informations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom du père *</label>
                  <input {...editForm.register('nomPere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom du père</label>
                  <input {...editForm.register('prenomPere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Téléphone principal *</label>
                  <input {...editForm.register('telephonePrincipal')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input {...editForm.register('emailPere')} type="email" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom de la mère</label>
                  <input {...editForm.register('nomMere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom de la mère</label>
                  <input {...editForm.register('prenomMere')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Adresse</label>
                  <input {...editForm.register('adresse')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ville</label>
                  <input {...editForm.register('ville')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Save size={16} /> {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Informations de la famille</h3>
                {canEdit('familles') && <button onClick={startEditing} className="text-sm text-primary hover:underline">Modifier</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Nom du père:</span> <strong>{famille.nomPere}</strong></div>
                <div><span className="text-muted-foreground">Prénom du père:</span> <strong>{famille.prenomPere || '-'}</strong></div>
                <div><span className="text-muted-foreground">Téléphone principal:</span> <strong>{famille.telephonePrincipal}</strong></div>
                <div><span className="text-muted-foreground">Email:</span> <strong>{famille.emailPere || '-'}</strong></div>
                <div><span className="text-muted-foreground">Nom de la mère:</span> <strong>{famille.nomMere || '-'}</strong></div>
                <div><span className="text-muted-foreground">Prénom de la mère:</span> <strong>{famille.prenomMere || '-'}</strong></div>
                <div><span className="text-muted-foreground">Adresse:</span> <strong>{famille.adresse || '-'}</strong></div>
                <div><span className="text-muted-foreground">Ville:</span> <strong>{famille.ville || '-'}</strong></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
