import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Users, GraduationCap } from 'lucide-react';
import { useFamille, useUpdateFamille } from '@/hooks/useFamilles';
import { usePaiementsByFamille } from '@/hooks/usePaiements';
import { KpiCard } from '@/components/shared/KpiCard';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { KpiSkeleton } from '@/components/shared/Skeletons';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getRecoveryRate } from '@/utils/constants';
import { Banknote, Percent } from 'lucide-react';

export default function FamilleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: famille, isLoading } = useFamille(id!);
  const { data: paiements } = usePaiementsByFamille(id!);
  const [activeTab, setActiveTab] = useState<'enfants' | 'paiements' | 'informations'>('enfants');

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
      {/* Back + Header */}
      <button onClick={() => navigate('/familles')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={18} /> Retour aux familles
      </button>

      <div className="bg-card rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{famille.nom} {famille.prenom}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {famille.telephone && <span className="flex items-center gap-1"><Phone size={14} /> {famille.telephone}</span>}
              {famille.email && <span className="flex items-center gap-1"><Mail size={14} /> {famille.email}</span>}
              {famille.ville && <span className="flex items-center gap-1"><MapPin size={14} /> {famille.ville}</span>}
            </div>
          </div>
          <PaymentStatusBadge due={famille.totalDu} paid={famille.totalPaye} status={famille.statut} />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total dû" value={famille.totalDu} icon={Banknote} isCurrency color="destructive" />
        <KpiCard title="Total payé" value={famille.totalPaye} icon={Banknote} isCurrency color="success" />
        <KpiCard title="Solde" value={famille.solde} icon={Banknote} isCurrency color="warning" />
        <KpiCard title="Taux recouvrement" value={getRecoveryRate(famille.totalDu, famille.totalPaye)} icon={Percent} color="primary" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'enfants' && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {!famille.enfants?.length ? (
            <div className="p-8 text-center text-muted-foreground">Aucun enfant enregistré</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Élève</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Classe</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Total dû</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Payé</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Solde</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {famille.enfants.map((e) => (
                  <tr key={e.id} onClick={() => navigate(`/eleves/${e.id}`)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-4 font-medium">{e.prenom} {e.nom}</td>
                    <td className="p-4">{e.classe}</td>
                    <td className="p-4">{formatCurrency(e.totalDu)}</td>
                    <td className="p-4">{formatCurrency(e.totalPaye)}</td>
                    <td className="p-4 font-medium">{formatCurrency(e.solde)}</td>
                    <td className="p-4"><PaymentStatusBadge due={e.totalDu} paid={e.totalPaye} status={e.statut} /></td>
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
              {paiements.map((p) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Nom:</span> <strong>{famille.nom}</strong></div>
            <div><span className="text-muted-foreground">Prénom:</span> <strong>{famille.prenom}</strong></div>
            <div><span className="text-muted-foreground">Téléphone:</span> <strong>{famille.telephone}</strong></div>
            <div><span className="text-muted-foreground">Email:</span> <strong>{famille.email || '-'}</strong></div>
            <div><span className="text-muted-foreground">Adresse:</span> <strong>{famille.adresse || '-'}</strong></div>
            <div><span className="text-muted-foreground">Ville:</span> <strong>{famille.ville || '-'}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
