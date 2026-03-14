import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, Users, MoreVertical, Eye, Pencil, Trash2, Printer, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiSkeleton, TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEleves, useClasses, useDeleteEleve } from '@/hooks/useEleves';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { generateAllStudentCardsPDF } from '@/utils/generatePDF';
import { useAnneeScolaireStore } from '@/store/anneeScolaireStore';
import { elevesApi } from '@/api/eleves.api';
import { useDashboardStats } from '@/hooks/useDashboard';
import type { Eleve } from '@/types/eleve.types';
import toast from 'react-hot-toast';

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
              onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          )}
        </div>
      )}
      {showConfirm && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-card border rounded-xl shadow-lg z-20 p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm font-semibold mb-1">Supprimer cet élève ?</p>
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
  const { data: stats, isLoading:isLoadingStats } = useDashboardStats();
  const { data: eleves, isLoading:isLooadingEleves } = useEleves();

  const { data: classes } = useClasses();
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [search, setSearch] = useState('');
  const [classeFilter, setClasseFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const anneeScolaire = useAnneeScolaireStore((s) => s.anneeScolaire);

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = eleves?.filter((e) => {
    const matchSearch = !search || `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase());
    const matchClasse = !classeFilter || e.classe === classeFilter;
    return matchSearch && matchClasse;
  });
  
  const totalElevesData = stats?.totalEleves;
  const totalElevesArray = Array.isArray(totalElevesData) ? totalElevesData : [];
  const totalElevesCount = Array.isArray(totalElevesData)
    ? totalElevesData.length
    : typeof totalElevesData === 'number'
    ? totalElevesData
    : 0;

  const handleExportCSV = async () => {
    if (!filtered?.length) return;
    setExporting(true);
    try {
      const dossiers = await Promise.all(filtered.map((e) => elevesApi.getById(e.id)));
      const headers = ['Matricule','Nom','Prénom','Date naissance','Lieu naissance','Sexe','Classe','Famille','Nationalité','Groupe sanguin','Allergies','Contact urgence','Remarques','Date inscription','Total dû','Total payé','Solde','Statut'];
      const rows = dossiers.map((d, i) => [
        d.matricule, d.nom, d.prenom,
        d.dateNaissance ? new Date(d.dateNaissance).toLocaleDateString('fr-FR') : '',
        d.lieuNaissance, d.sexe === 'M' || d.sexe === '0' ? 'Masculin' : 'Féminin',
        d.classe || '', d.famille || '', d.nationalite || '', d.groupeSanguin || '',
        d.allergies || '', d.contactUrgence || '', d.remarques || '',
        d.dateInscription ? new Date(d.dateInscription).toLocaleDateString('fr-FR') : '',
        d.totalDu ?? 0, d.totalPaye ?? 0, d.solde ?? 0, filtered[i].statut || '',
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eleves-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${dossiers.length} élève(s) exporté(s)`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Élèves" subtitle={`${eleves?.length ?? 0} élèves inscrits`}>
        <div className="flex items-center gap-2 flex-wrap">
          {filtered && filtered.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <Download size={16} /> {exporting ? 'Export...' : 'CSV'}
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
        {isLoadingStats? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Eleves" value={totalElevesCount} icon={GraduationCap} color="primary" />
            <KpiCard
              title="Garcons"
              value={totalElevesArray.filter((e) => e.sexe === 'M' || e.sexe === 'Masculin' || e.sexe === 0).length}
              icon={Users}
              color="success"
            />
            <KpiCard
              title="Filles"
              value={totalElevesArray.filter((e) => e.sexe === 'F' || e.sexe === 'Féminin' || e.sexe === 1).length}
              icon={Users}
              color="destructive"
            />
            <KpiCard title="Classes" value={`${stats?.classe?.length ?? 0}%`} icon={GraduationCap} />
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
      </div>


      {isLooadingEleves ? (
        <div className="bg-card rounded-2xl border shadow-sm p-6"><TableSkeleton /></div>
      ) : !filtered?.length ? (
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <EmptyState icon={<GraduationCap size={48} strokeWidth={1} />} title="Aucun élève trouvé" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom complet</th>
                  <th>Classe</th>
                  <th>Famille</th>
                  {canView('finances') && <th>Solde</th>}
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="cursor-pointer">
                    <td><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">{e.matricule}</span></td>
                    <td className="font-medium">{e.prenom} {e.nom}</td>
                    <td>{e.classe || '-'}</td>
                    <td className="text-muted-foreground">{e.famille || '-'}</td>
                    {canView('finances') && <td className="font-medium">{formatCurrency(e.solde)}</td>}
                    <td><PaymentStatusBadge status={e.statut} /></td>
                    <td className="text-right">
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
