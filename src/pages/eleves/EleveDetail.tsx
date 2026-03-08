import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CreditCard, FileText, BarChart3, ClipboardList, Download } from 'lucide-react';
import { useEleve } from '@/hooks/useEleves';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { Banknote } from 'lucide-react';
import { generateStudentCardPDF } from '@/utils/generatePDF';
import { getPaymentStatus } from '@/utils/constants';
import { useAnneeScolaireStore } from '@/store/anneeScolaireStore';

export default function EleveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: eleve, isLoading } = useEleve(id!);
  const [activeTab, setActiveTab] = useState<'informations' | 'finances' | 'notes' | 'documents'>('informations');
  const anneeScolaire = useAnneeScolaireStore((s) => s.anneeScolaire);

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

      {/* Header Card */}
      <div className="bg-card rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {eleve.prenom[0]}{eleve.nom[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{eleve.prenom} {eleve.nom}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="status-badge-active font-mono">{eleve.matricule}</span>
              <span className="text-sm text-muted-foreground">{eleve.classe || '-'}</span>
            </div>
          </div>
        </div>
      </div>

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
            { label: "Carte d'élève", icon: CreditCard, action: () => generateStudentCardPDF({ nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule, classe: eleve.classe || '', anneeScolaire }) },
            { label: "Certificat de scolarité", icon: FileText, action: () => {} },
            { label: "Bulletin financier", icon: BarChart3, action: () => {} },
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
