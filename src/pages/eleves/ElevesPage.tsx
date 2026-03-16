import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, Users, MoreVertical, Eye, Pencil, Trash2, Printer, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import { SortableTableHeader, toggleSort, sortData, type SortState } from '@/components/shared/SortableTableHeader';
import { useEleves, useClasses, useDeleteEleve } from '@/hooks/useEleves';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { generateAllStudentCardsPDF } from '@/utils/generatePDF';
import { useAnneeScolaireStore } from '@/store/anneeScolaireStore';
import { elevesApi } from '@/api/eleves.api';
import { batchAsync } from '@/utils/batchAsync';
import { useDashboardStats } from '@/hooks/useDashboard';
import type { Eleve } from '@/types/eleve.types';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionBar } from '@/components/shared/BulkActionBar';

function ActionMenu({ eleve, canEdit, canDelete, onDelete }: {
  eleve: Eleve;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: () => void;
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

function isMale(sexe: any): boolean {
  // Enum C# Masculin=1, Feminin=2
  // API peut retourner : 'Masculin', 'M', 1, '1' pour masculin
  // et 'Feminin' (sans accent), 'Féminin', 'F', 2, '2' pour féminin
  if (sexe === 'Feminin' || sexe === 'Féminin' || sexe === 'F' || sexe === 2 || sexe === '2') return false;
  return sexe === 'Masculin' || sexe === 'M' || sexe === 1 || sexe === '1';
}

export default function ElevesPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: eleves, isLoading: isLoadingEleves } = useEleves();
  const { data: classes } = useClasses();
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [search, setSearch] = useState('');
  const [classeFilter, setClasseFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const anneeScolaire = useAnneeScolaireStore((s) => s.anneeScolaire);
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingEleve, setDeletingEleve] = useState<Eleve | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const deleteMutation = useDeleteEleve();

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await new Promise<void>((resolve) => {
        deleteMutation.mutate(id, { onSettled: () => resolve() });
      });
    }
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = useMemo(() => {
    const list = eleves?.filter((e) => {
      const matchSearch = !search || `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase());
      const matchClasse = !classeFilter || e.classe === classeFilter;
      return matchSearch && matchClasse;
    }) ?? [];
    return sortData(list, sort, (item, key) => {
      switch (key) {
        case 'matricule': return item.matricule;
        case 'nom': return `${item.prenom} ${item.nom}`;
        case 'classe': return item.classe;
        case 'famille': return item.famille;
        case 'solde': return item.solde;
        case 'statut': return item.statut;
        default: return '';
      }
    });
  }, [eleves, search, classeFilter, sort]);

  // KPIs calculés depuis la vraie liste d'élèves (totalEleves dans stats est un number, pas un tableau)
  const totalElevesCount = eleves?.length ?? 0;
  const garcons = useMemo(() => eleves?.filter((e) => isMale(e.sexe)).length ?? 0, [eleves]);
  const filles = useMemo(() => eleves?.filter((e) => !isMale(e.sexe)).length ?? 0, [eleves]);
  const nbClasses = stats?.statistiquesParClasse?.length ?? 0;

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((e) => e.id)));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleExportCSV = async () => {
    const items = selectedIds.size > 0 ? filtered.filter(e => selectedIds.has(e.id)) : filtered;
    if (!items.length) return;
    setExporting(true);
    try {
      const dossiers = await batchAsync(
        items,
        (e) => elevesApi.getById(e.id),
        10,
        (done, total) => setExportProgress(`Récupération des données... ${done}/${total}`),
      );
      const headers = ['Matricule','Nom','Prénom','Date naissance','Lieu naissance','Sexe','Classe','Famille','Nationalité','Groupe sanguin','Allergies','Contact urgence','Remarques','Date inscription','Total dû','Total payé','Solde','Statut'];
      const rows = dossiers.map((d, i) => [
        d.matricule, d.nom, d.prenom,
        d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString('fr-FR') : '',
        d.lieuNaissance, isMale(d.sexe) ? 'Masculin' : 'Féminin',
        d.classe || '', d.famille || '', d.nationalite || '', d.groupeSanguin || '',
        d.allergies || '', d.contactUrgence || '', d.remarques || '',
        d.dateInscription ? new Date(d.dateInscription).toLocaleDateString('fr-FR') : '',
        d.totalDu ?? 0, d.totalPaye ?? 0, d.solde ?? 0, items[i].statut || '',
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `eleves-${new Date().toISOString().slice(0, 10)}.csv`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${dossiers.length} élève(s) exporté(s) • fichier: ${filename}`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
      setExportProgress('');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingEleve) return;
    deleteMutation.mutate(deletingEleve.id, {
      onSuccess: () => setDeletingEleve(null),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Élèves" subtitle={`${eleves?.length ?? 0} élèves inscrits`}>
        <div className="flex items-center gap-2 flex-wrap">
          {filtered.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <Download size={16} />
                {exporting ? exportProgress || 'Export...' : selectedIds.size > 0 ? `CSV (${selectedIds.size})` : 'CSV'}
              </button>
              <button
                onClick={() => generateAllStudentCardsPDF(filtered.map((e) => ({
                  nom: e.nom, prenom: e.prenom, matricule: e.matricule,
                  classe: e.classe || '', anneeScolaire,
                })))}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <Printer size={16} /> Cartes
              </button>
            </>
          )}
          {canCreate('eleves') && (
            <button
              onClick={() => navigate('/eleves/nouveau')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={16} /> Inscription
            </button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingEleves ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Élèves" value={totalElevesCount} icon={GraduationCap} color="primary" tooltipContent="Nombre total d'élèves inscrits cette année" />
            <KpiCard title="Garçons" value={garcons} icon={Users} color="success" tooltipContent={`${garcons} garçons sur ${totalElevesCount} élèves`} />
            <KpiCard title="Filles" value={filles} icon={Users} color="destructive" tooltipContent={`${filles} filles sur ${totalElevesCount} élèves`} />
            <KpiCard title="Classes" value={nbClasses} icon={GraduationCap} color="info" tooltipContent={`${nbClasses} classes avec élèves inscrits`} />
          </>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Rechercher un élève..." onSearch={handleSearch} />
        <select
          value={classeFilter}
          onChange={(e) => setClasseFilter(e.target.value)}
          className="px-3.5 py-2.5 border rounded-xl bg-card text-sm text-foreground outline-none shadow-sm focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Toutes les classes</option>
          {classes?.map((c) => (
            <option key={c.id} value={c.nom}>{c.nom}</option>
          ))}
        </select>
        {selectedIds.size > 0 && canDelete('eleves') && (
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedIds.size} sélectionné(s)
          </span>
        )}
      </div>

      {isLoadingEleves ? (
        <div className="bg-card rounded-2xl border shadow-sm p-6"><TableSkeleton /></div>
      ) : !filtered.length ? (
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <EmptyState icon={<GraduationCap size={48} strokeWidth={1} />} title="Aucun élève trouvé" />
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
                  <SortableTableHeader label="Matricule" sortKey="matricule" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  <SortableTableHeader label="Nom complet" sortKey="nom" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  <SortableTableHeader label="Classe" sortKey="classe" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  <SortableTableHeader label="Famille" sortKey="famille" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  {canView('finances') && <SortableTableHeader label="Solde" sortKey="solde" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />}
                  <SortableTableHeader label="Statut" sortKey="statut" currentSort={sort} onSort={(k) => setSort(toggleSort(sort, k))} />
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="cursor-pointer">
                    <td>
                      <Checkbox
                        checked={selectedIds.has(e.id)}
                        onCheckedChange={() => toggleSelect(e.id)}
                        onClick={(ev) => ev.stopPropagation()}
                      />
                    </td>
                    <td><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">{e.matricule}</span></td>
                    <td className="font-medium">{e.prenom} {e.nom}</td>
                    <td>{e.classe || '-'}</td>
                    <td className="text-muted-foreground">{e.famille || '-'}</td>
                    {canView('finances') && <td className="font-medium">{formatCurrency(e.solde)}</td>}
                    <td><PaymentStatusBadge status={e.statut} /></td>
                    <td className="text-right">
                      <ActionMenu eleve={e} canEdit={canEdit('eleves')} canDelete={canDelete('eleves')} onDelete={() => setDeletingEleve(e)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deletingEleve || bulkDeleting}
        onOpenChange={(open) => { if (!open) { setDeletingEleve(null); setBulkDeleting(false); } }}
        description={
          deletingEleve === null && bulkDeleting
            ? `${selectedIds.size} élève(s) seront définitivement supprimés.`
            : `L'élève ${deletingEleve?.prenom ?? ''} ${deletingEleve?.nom ?? ''} sera définitivement supprimé.`
        }
        onConfirm={bulkDeleting ? handleBulkDelete : handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <BulkActionBar
        count={selectedIds.size}
        entityLabel="élève"
        onClear={() => setSelectedIds(new Set())}
        onExport={handleExportCSV}
        onDelete={canDelete('eleves') ? () => { setBulkDeleting(true); setDeletingEleve(null); } : undefined}
      />
    </div>
  );
}