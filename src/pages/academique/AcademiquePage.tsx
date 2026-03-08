import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';

export default function AcademiquePage() {
  return (
    <div>
      <PageHeader title="Académique" subtitle="Gestion académique" />
      <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
        <BookOpen size={48} strokeWidth={1} className="mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold mb-1">Module académique</h2>
        <p className="text-sm text-muted-foreground">Gestion des notes, emplois du temps et bulletins. Fonctionnalité en cours de développement.</p>
      </div>
    </div>
  );
}
