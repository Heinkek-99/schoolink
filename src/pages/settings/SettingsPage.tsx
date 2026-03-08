import { PageHeader } from '@/components/layout/PageHeader';
import { Settings, School, CreditCard, Users, Bell } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { label: 'Établissement', desc: "Informations de l'école", icon: School },
    { label: 'Types de frais', desc: 'Gérer les frais scolaires', icon: CreditCard },
    { label: 'Utilisateurs', desc: 'Gestion des comptes', icon: Users },
    { label: 'Notifications', desc: 'Préférences de notification', icon: Bell },
  ];

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Configuration de l'application" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <button
            key={s.label}
            className="bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="rounded-xl p-3 bg-primary/10 text-primary">
              <s.icon size={22} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
