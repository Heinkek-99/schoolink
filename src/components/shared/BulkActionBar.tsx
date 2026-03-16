import { Trash2, Download, X } from 'lucide-react';

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  isDeleting?: boolean;
  entityLabel?: string;
}

export function BulkActionBar({ count, onClear, onDelete, onExport, isDeleting, entityLabel = 'élément' }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-2xl shadow-2xl">
        <span className="text-sm font-semibold whitespace-nowrap">
          {count} {entityLabel}{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
        </span>

        <div className="w-px h-5 bg-background/20" />

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-background/10 hover:bg-background/20 transition-colors"
          >
            <Download size={14} />
            Exporter
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={14} />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
        )}

        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-background/20 transition-colors ml-1"
          title="Désélectionner tout"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
