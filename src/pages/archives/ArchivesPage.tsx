import { useState } from 'react';
import { Archive, RotateCcw, Users, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useArchivedFamilles, useRestoreFamille } from '@/hooks/useFamilles';
import { useArchivedEleves, useRestoreEleve } from '@/hooks/useEleves';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ArchivesPage() {
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<'familles' | 'eleves'>('familles');
  const { data: archivedFamilles, isLoading: loadingFamilles } = useArchivedFamilles();
  const { data: archivedEleves, isLoading: loadingEleves } = useArchivedEleves();
  const restoreFamille = useRestoreFamille();
  const restoreEleve = useRestoreEleve();
  const [confirmRestore, setConfirmRestore] = useState<{ type: 'famille' | 'eleve'; id: string; name: string } | null>(null);

  const handleRestore = () => {
    if (!confirmRestore) return;
    if (confirmRestore.type === 'famille') {
      restoreFamille.mutate(confirmRestore.id, { onSuccess: () => setConfirmRestore(null) });
    } else {
      restoreEleve.mutate(confirmRestore.id, { onSuccess: () => setConfirmRestore(null) });
    }
  };

  const tabs = [
    { key: 'familles' as const, label: 'Familles', count: archivedFamilles?.length ?? 0 },
    { key: 'eleves' as const, label: 'Élèves', count: archivedEleves?.length ?? 0 },
  ];

  if (!isAdmin) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Archive size={48} strokeWidth={1} className="mx-auto mb-3" />
        <p className="font-medium">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Archives" subtitle="Éléments archivés - restauration possible" />

      <div className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} {tab.count > 0 && <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'familles' && (
        <>
          {loadingFamilles ? (
            <div className="bg-card rounded-xl border shadow-sm p-5"><TableSkeleton /></div>
          ) : !archivedFamilles?.length ? (
            <div className="bg-card rounded-xl border shadow-sm p-5">
              <EmptyState icon={<Users size={48} strokeWidth={1} />} title="Aucune famille archivée" />
            </div>
          ) : (
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Famille</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Téléphone</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Ville</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Enfants</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {archivedFamilles.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{f.nomPere} {f.prenomPere}</td>
                      <td className="p-4 text-muted-foreground">{f.telephonePrincipal}</td>
                      <td className="p-4 text-muted-foreground">{f.ville || '-'}</td>
                      <td className="p-4">{f.nombreEnfants}</td>
                      <td className="p-4">{formatCurrency(f.soldeGlobal)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setConfirmRestore({ type: 'famille', id: f.id, name: `${f.nomPere} ${f.prenomPere}` })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <RotateCcw size={14} /> Restaurer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'eleves' && (
        <>
          {loadingEleves ? (
            <div className="bg-card rounded-xl border shadow-sm p-5"><TableSkeleton /></div>
          ) : !archivedEleves?.length ? (
            <div className="bg-card rounded-xl border shadow-sm p-5">
              <EmptyState icon={<GraduationCap size={48} strokeWidth={1} />} title="Aucun élève archivé" />
            </div>
          ) : (
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Matricule</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Nom complet</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Classe</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Famille</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {archivedEleves.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4"><span className="font-mono text-muted-foreground">{e.matricule}</span></td>
                      <td className="p-4 font-medium">{e.prenom} {e.nom}</td>
                      <td className="p-4">{e.classe || '-'}</td>
                      <td className="p-4">{e.famille || '-'}</td>
                      <td className="p-4">{formatCurrency(e.solde)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setConfirmRestore({ type: 'eleve', id: e.id, name: `${e.prenom} ${e.nom}` })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <RotateCcw size={14} /> Restaurer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Restore confirmation */}
      {confirmRestore && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmRestore(null)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Restaurer cet élément ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>{confirmRestore.name}</strong> sera restauré(e) et réapparaîtra dans la liste active.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRestore(null)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Annuler
              </button>
              <button
                onClick={handleRestore}
                disabled={restoreFamille.isPending || restoreEleve.isPending}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {restoreFamille.isPending || restoreEleve.isPending ? 'Restauration...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
