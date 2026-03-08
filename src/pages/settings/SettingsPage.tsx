import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { School, CreditCard, Users, Bell, Plus, Save, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTypeFrais, useCreateTypeFrais } from '@/hooks/usePaiements';
import { usePermissions } from '@/hooks/usePermissions';
import { useNotificationStore } from '@/store/notificationStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { TableSkeleton } from '@/components/shared/Skeletons';
import toast from 'react-hot-toast';

const etablissementSchema = z.object({
  nomEtablissement: z.string().min(1, 'Nom requis'),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  directeur: z.string().optional(),
  anneeScolaire: z.string().min(1, 'Année scolaire requise'),
});

const typeFraisSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  montant: z.number().min(1, 'Montant requis'),
  description: z.string().optional(),
});

type EtablissementForm = z.infer<typeof etablissementSchema>;
type TypeFraisForm = z.infer<typeof typeFraisSchema>;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'etablissement' | 'typefrais' | 'utilisateurs' | 'notifications'>('etablissement');
  const { data: typeFrais, isLoading: typeFraisLoading } = useTypeFrais();
  const createTypeFraisMutation = useCreateTypeFrais();
  const { canCreate, canEdit, isAdmin, isDirecteur } = usePermissions();
  const notifications = useNotificationStore((s) => s.notifications);
  const [showNewTypeFrais, setShowNewTypeFrais] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const etabForm = useForm<EtablissementForm>({
    resolver: zodResolver(etablissementSchema),
    defaultValues: {
      nomEtablissement: '',
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      directeur: '',
      anneeScolaire: '2024-2025',
    },
  });

  const typeFraisForm = useForm<TypeFraisForm>({
    resolver: zodResolver(typeFraisSchema),
  });

  // Load saved etablissement data
  useEffect(() => {
    const saved = localStorage.getItem('etablissement');
    if (saved) {
      try {
        etabForm.reset(JSON.parse(saved));
      } catch {}
    }
    const savedLogo = localStorage.getItem('etablissement_logo');
    if (savedLogo) setLogoPreview(savedLogo);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500_000) {
        toast.error('Le logo ne doit pas dépasser 500 Ko');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem('etablissement_logo');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const onSaveEtablissement = (data: EtablissementForm) => {
    localStorage.setItem('etablissement', JSON.stringify(data));
    if (logoPreview) {
      localStorage.setItem('etablissement_logo', logoPreview);
    } else {
      localStorage.removeItem('etablissement_logo');
    }
    // Dispatch event so Sidebar updates immediately
    window.dispatchEvent(new Event('etablissement-updated'));
    toast.success("Informations de l'établissement enregistrées");
  };

  const onCreateTypeFrais = (data: TypeFraisForm) => {
    createTypeFraisMutation.mutate(
      { nom: data.nom, montant: data.montant, description: data.description },
      {
        onSuccess: () => {
          setShowNewTypeFrais(false);
          typeFraisForm.reset();
        },
      }
    );
  };

  const sections = [
    { key: 'etablissement' as const, label: 'Établissement', desc: "Informations de l'école", icon: School },
    ...(canCreate('typefrais') || isAdmin ? [{ key: 'typefrais' as const, label: 'Types de frais', desc: 'Gérer les frais scolaires', icon: CreditCard }] : []),
    ...(isAdmin ? [{ key: 'utilisateurs' as const, label: 'Utilisateurs', desc: 'Gestion des comptes', icon: Users }] : []),
    { key: 'notifications' as const, label: 'Notifications', desc: 'Historique des événements', icon: Bell },
  ];

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Configuration de l'application" />

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="lg:w-64 shrink-0">
          <div className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-colors ${
                  activeSection === s.key ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <s.icon size={20} strokeWidth={1.5} />
                <div>
                  <p className={activeSection === s.key ? 'font-medium' : ''}>{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeSection === 'etablissement' && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Informations de l'établissement</h2>
              <form onSubmit={etabForm.handleSubmit(onSaveEtablissement)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Logo upload */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Logo de l'établissement</label>
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="relative h-20 w-20 rounded-xl bg-muted flex items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors overflow-hidden"
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-1" />
                        ) : (
                          <Upload size={24} className="text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cliquez pour charger un logo (max 500 Ko)</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG ou SVG recommandé</p>
                        {logoPreview && (
                          <button type="button" onClick={removeLogo} className="flex items-center gap-1 text-xs text-destructive hover:underline mt-1">
                            <X size={12} /> Supprimer le logo
                          </button>
                        )}
                      </div>
                      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Nom de l'établissement *</label>
                    <input {...etabForm.register('nomEtablissement')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Directeur</label>
                    <input {...etabForm.register('directeur')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Année scolaire *</label>
                    <input {...etabForm.register('anneeScolaire')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Téléphone</label>
                    <input {...etabForm.register('telephone')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <input {...etabForm.register('email')} type="email" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Adresse</label>
                    <input {...etabForm.register('adresse')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ville</label>
                    <input {...etabForm.register('ville')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save size={16} /> Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'typefrais' && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Types de frais scolaires</h2>
                <button
                  onClick={() => setShowNewTypeFrais(!showNewTypeFrais)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Nouveau type
                </button>
              </div>

              {showNewTypeFrais && (
                <form onSubmit={typeFraisForm.handleSubmit(onCreateTypeFrais)} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nom *</label>
                      <input {...typeFraisForm.register('nom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Montant (FCFA) *</label>
                      <input {...typeFraisForm.register('montant', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <input {...typeFraisForm.register('description')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowNewTypeFrais(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
                    <button type="submit" disabled={createTypeFraisMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      {createTypeFraisMutation.isPending ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </form>
              )}

              {typeFraisLoading ? (
                <TableSkeleton rows={4} cols={3} />
              ) : !typeFrais?.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Aucun type de frais configuré</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Nom</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Montant</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {typeFrais.map((tf: any) => (
                        <tr key={tf.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{tf.nom || tf.libelle}</td>
                          <td className="p-4">{formatCurrency(tf.montant)}</td>
                          <td className="p-4 text-muted-foreground">{tf.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === 'utilisateurs' && (
            <div className="bg-card rounded-xl border shadow-sm p-8 text-center text-muted-foreground">
              <Users size={48} strokeWidth={1} className="mx-auto mb-3" />
              <p className="font-medium">Gestion des utilisateurs</p>
              <p className="text-sm">Fonctionnalité à venir</p>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Historique des événements</h2>
              {!notifications.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Bell size={48} strokeWidth={1} className="mx-auto mb-3 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 rounded-lg border text-sm ${!n.read ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{n.title}</p>
                        <span className="text-[11px] text-muted-foreground">{new Date(n.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
