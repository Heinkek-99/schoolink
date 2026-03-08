import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CreditCard, FileText, BarChart3, ClipboardList, Download, Trash2, Pencil, Save, Banknote, Printer, Upload } from 'lucide-react';
import { useEleve, useDeleteEleve, useUpdateEleve, useClasses } from '@/hooks/useEleves';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { generateStudentCardPDF, generateReceiptPDF, generateBulletinFinancierPDF, generateCertificatScolaritePDF } from '@/utils/generatePDF';
import { getPaymentStatus } from '@/utils/constants';
import { useAnneeScolaireStore } from '@/store/anneeScolaireStore';
import api from '@/api/axios.config';

const editEleveSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  dateNaissance: z.string().min(1, 'Date requise'),
  lieuNaissance: z.string().min(1, 'Lieu requis'),
  sexe: z.string().min(1, 'Sexe requis'),
  nationalite: z.string().optional(),
  groupeSanguin: z.string().optional(),
  allergies: z.string().optional(),
  contactUrgence: z.string().optional(),
  remarques: z.string().optional(),
});

type EditEleveForm = z.infer<typeof editEleveSchema>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EleveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: eleve, isLoading } = useEleve(id!);
  const { data: classes } = useClasses();
  const deleteMutation = useDeleteEleve();
  const updateMutation = useUpdateEleve();
  const { canEdit, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<'informations' | 'finances' | 'notes' | 'documents'>('informations');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const anneeScolaire = useAnneeScolaireStore((s) => s.anneeScolaire);

  const editForm = useForm<EditEleveForm>({
    resolver: zodResolver(editEleveSchema),
  });

  const startEditing = () => {
    if (eleve) {
      editForm.reset({
        nom: eleve.nom,
        prenom: eleve.prenom,
        dateNaissance: eleve.dateNaissance?.split('T')[0] || '',
        lieuNaissance: eleve.lieuNaissance,
        sexe: eleve.sexe,
        nationalite: eleve.nationalite || '',
        groupeSanguin: eleve.groupeSanguin || '',
        allergies: eleve.allergies || '',
        contactUrgence: eleve.contactUrgence || '',
        remarques: eleve.remarques || '',
      });
      setEditPhoto(null);
      setEditPhotoPreview(photoUrl);
    }
    setIsEditing(true);
  };

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSave = (data: EditEleveForm) => {
    updateMutation.mutate(
      { id: id!, data: { nom: data.nom, prenom: data.prenom, dateNaissance: data.dateNaissance, lieuNaissance: data.lieuNaissance, sexe: data.sexe, nationalite: data.nationalite, groupeSanguin: data.groupeSanguin, allergies: data.allergies, contactUrgence: data.contactUrgence, remarques: data.remarques, photo: editPhoto || undefined } },
      { onSuccess: () => { setIsEditing(false); setEditPhoto(null); setEditPhotoPreview(null); } }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => navigate('/eleves'),
    });
  };

  // Build photo URL
  const photoUrl = eleve?.photoPath
    ? (eleve.photoPath.startsWith('http') ? eleve.photoPath : `${api.defaults.baseURL}/${eleve.photoPath}`)
    : null;

  if (isLoading) return <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <KpiSkeleton key={i} />)}</div>;
  if (!eleve) return <div className="text-center py-16 text-muted-foreground">Élève non trouvé</div>;

  const tabs = [
    { key: 'informations' as const, label: 'Informations' },
    { key: 'finances' as const, label: 'Finances' },
    { key: 'notes' as const, label: 'Notes' },
    { key: 'documents' as const, label: 'Documents' },
  ];

  return (
    <div>
      <button onClick={() => navigate('/eleves')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={18} /> Retour aux élèves
      </button>

      <div className="bg-card rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <img src={photoUrl} alt={`${eleve.prenom} ${eleve.nom}`} className="h-16 w-16 rounded-full object-cover border" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {eleve.prenom[0]}{eleve.nom[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{eleve.prenom} {eleve.nom}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="status-badge-active font-mono">{eleve.matricule}</span>
                <span className="text-sm text-muted-foreground">{eleve.classe || '-'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit('eleves') && (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <Pencil size={16} /> Modifier
              </button>
            )}
            {isAdmin && (
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

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-destructive mb-2">Supprimer cet élève ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              L'élève <strong>{eleve.prenom} {eleve.nom}</strong> ({eleve.matricule}) sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditing(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Modifier l'élève</h2>
            <form onSubmit={editForm.handleSubmit(onSave)} className="space-y-4">
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="relative h-20 w-20 rounded-full bg-muted flex items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors overflow-hidden"
                >
                  {editPhotoPreview ? (
                    <img src={editPhotoPreview} alt="Photo" className="h-full w-full object-cover" />
                  ) : (
                    <Upload size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Photo de l'élève</p>
                  <p className="text-xs text-muted-foreground">Cliquez pour modifier la photo</p>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handleEditPhotoChange} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom *</label>
                  <input {...editForm.register('nom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prénom *</label>
                  <input {...editForm.register('prenom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date de naissance *</label>
                  <input {...editForm.register('dateNaissance')} type="date" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Lieu de naissance *</label>
                  <input {...editForm.register('lieuNaissance')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sexe *</label>
                  <select {...editForm.register('sexe')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="0">Masculin</option>
                    <option value="1">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nationalité</label>
                  <input {...editForm.register('nationalite')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Groupe sanguin</label>
                  <select {...editForm.register('groupeSanguin')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Non renseigné</option>
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Contact d'urgence</label>
                  <input {...editForm.register('contactUrgence')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Allergies</label>
                <input {...editForm.register('allergies')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Remarques</label>
                <textarea {...editForm.register('remarques')} rows={2} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Save size={16} /> {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'informations' && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Nom:</span> <strong>{eleve.nom}</strong></div>
            <div><span className="text-muted-foreground">Prénom:</span> <strong>{eleve.prenom}</strong></div>
            <div><span className="text-muted-foreground">Date de naissance:</span> <strong>{formatDate(eleve.dateNaissance)}</strong></div>
            <div><span className="text-muted-foreground">Lieu de naissance:</span> <strong>{eleve.lieuNaissance}</strong></div>
            <div><span className="text-muted-foreground">Sexe:</span> <strong>{eleve.sexe === 'M' || eleve.sexe === '0' ? 'Masculin' : 'Féminin'}</strong></div>
            <div><span className="text-muted-foreground">Matricule:</span> <strong>{eleve.matricule}</strong></div>
            <div><span className="text-muted-foreground">Classe:</span> <strong>{eleve.classe || '-'}</strong></div>
            <div><span className="text-muted-foreground">Famille:</span> <strong>{eleve.famille || '-'}</strong></div>
            {eleve.nationalite && <div><span className="text-muted-foreground">Nationalité:</span> <strong>{eleve.nationalite}</strong></div>}
            {eleve.groupeSanguin && <div><span className="text-muted-foreground">Groupe sanguin:</span> <strong>{eleve.groupeSanguin}</strong></div>}
            {eleve.contactUrgence && <div><span className="text-muted-foreground">Contact d'urgence:</span> <strong>{eleve.contactUrgence}</strong></div>}
            {eleve.allergies && <div><span className="text-muted-foreground">Allergies:</span> <strong>{eleve.allergies}</strong></div>}
            {eleve.remarques && <div className="md:col-span-2"><span className="text-muted-foreground">Remarques:</span> <strong>{eleve.remarques}</strong></div>}
            {eleve.dateInscription && <div><span className="text-muted-foreground">Date d'inscription:</span> <strong>{formatDate(eleve.dateInscription)}</strong></div>}
          </div>
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="Total dû" value={eleve.totalDu ?? 0} icon={Banknote} isCurrency color="destructive" />
            <KpiCard title="Total payé" value={eleve.totalPaye ?? 0} icon={Banknote} isCurrency color="success" />
            <KpiCard title="Solde" value={eleve.solde ?? 0} icon={Banknote} isCurrency color="warning" />
          </div>

          {eleve.frais?.length ? (
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Période</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Montant</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Payé</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                     <th className="text-left p-4 font-medium text-muted-foreground">Échéance</th>
                     <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                     <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {eleve.frais.map((f) => (
                     <tr key={f.id}>
                       <td className="p-4">{f.libelle}</td>
                       <td className="p-4 text-muted-foreground">{f.periode || '-'}</td>
                       <td className="p-4">{formatCurrency(f.montant)}</td>
                       <td className="p-4">{formatCurrency(f.montantPaye)}</td>
                       <td className="p-4 font-medium">{formatCurrency(f.montant - f.montantPaye)}</td>
                       <td className="p-4 text-muted-foreground">{f.echeance ? formatDate(f.echeance) : '-'}</td>
                       <td className="p-4">
                         <PaymentStatusBadge status={f.isEchu ? 'Impayé' : getPaymentStatus(f.montant, f.montantPaye)} />
                       </td>
                       <td className="p-4 text-right">
                         {f.montantPaye > 0 && (
                           <button
                              onClick={() => generateReceiptPDF({
                                familleNom: eleve.famille || '-',
                                eleveNom: `${eleve.prenom} ${eleve.nom}`,
                                eleveClasse: eleve.classe || '-',
                                date: new Date().toLocaleDateString('fr-FR'),
                                montant: f.montantPaye,
                                mode: '-',
                                objet: f.libelle,
                                montantDuCompte: eleve.totalDu,
                                soldeDu: eleve.solde,
                                ventilations: [{ eleveNom: `${eleve.prenom} ${eleve.nom}`, montant: f.montantPaye }],
                              })}
                             className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                             title="Imprimer le reçu"
                           >
                             <Printer size={14} /> Reçu
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground">Aucun frais enregistré</div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-card rounded-xl border shadow-sm p-8 text-center text-muted-foreground">
          <ClipboardList size={48} strokeWidth={1} className="mx-auto mb-3" />
          <p className="font-medium">Notes et bulletins</p>
          <p className="text-sm">Fonctionnalité à venir</p>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Carte d'élève", icon: CreditCard, action: () => generateStudentCardPDF({ nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule, classe: eleve.classe || '', anneeScolaire, dateNaissance: eleve.dateNaissance?.split('T')[0], lieuNaissance: eleve.lieuNaissance, sexe: eleve.sexe, photoUrl: photoUrl || undefined }) },
            { label: "Certificat de scolarité", icon: FileText, action: () => generateCertificatScolaritePDF({ nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule, classe: eleve.classe || '', anneeScolaire, dateNaissance: eleve.dateNaissance?.split('T')[0], lieuNaissance: eleve.lieuNaissance, sexe: eleve.sexe }) },
            { label: "Bulletin financier", icon: BarChart3, action: () => generateBulletinFinancierPDF({ nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule, classe: eleve.classe || '', anneeScolaire, famille: eleve.famille || '-', totalDu: eleve.totalDu, totalPaye: eleve.totalPaye, solde: eleve.solde, frais: eleve.frais || [] }) },
            { label: "Bulletin de notes", icon: ClipboardList, action: () => {} },
          ].map((doc) => (
            <button
              key={doc.label}
              onClick={doc.action}
              className="bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="rounded-xl p-3 bg-primary/10 text-primary">
                <doc.icon size={22} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{doc.label}</p>
                <p className="text-xs text-muted-foreground">Générer en PDF</p>
              </div>
              <Download size={18} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
