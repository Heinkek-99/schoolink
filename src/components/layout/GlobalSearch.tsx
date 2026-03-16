import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Users, Banknote, X, ArrowRight } from 'lucide-react';
import { useEleves } from '@/hooks/useEleves';
import { useFamilles } from '@/hooks/useFamilles';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: 'eleve' | 'famille';
  url: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: eleves } = useEleves();
  const { data: familles } = useFamilles();

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    eleves?.forEach((e) => {
      if (`${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q)) {
        items.push({
          id: e.id,
          label: `${e.prenom} ${e.nom}`,
          sublabel: `${e.matricule} • ${e.classe || 'Sans classe'}`,
          type: 'eleve',
          url: `/eleves/${e.id}`,
        });
      }
    });

    familles?.forEach((f) => {
      if (`${f.nomPere} ${f.prenomPere} ${f.telephonePrincipal}`.toLowerCase().includes(q)) {
        items.push({
          id: f.id,
          label: `${f.nomPere} ${f.prenomPere}`,
          sublabel: `${f.nombreEnfants} enfant(s) • ${f.telephonePrincipal}`,
          type: 'famille',
          url: `/familles/${f.id}`,
        });
      }
    });

    return items.slice(0, 8);
  }, [query, eleves, familles]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.url);
    setOpen(false);
    setQuery('');
  }, [navigate]);

  const iconForType = (type: 'eleve' | 'famille') => {
    if (type === 'eleve') return <GraduationCap size={16} className="text-primary shrink-0" />;
    return <Users size={16} className="text-primary shrink-0" />;
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 bg-muted rounded-xl px-3 py-2 transition-colors hover:bg-muted/80 ${isMobile ? 'flex-1 min-w-0' : 'w-72'}`}
      >
        <Search size={16} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
        <span className="text-sm text-muted-foreground flex-1 text-left truncate">Rechercher...</span>
        {!isMobile && (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-background border rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        )}
      </button>

      {/* Overlay + Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => { setOpen(false); setQuery(''); }} />
          <div ref={panelRef} className="relative w-full max-w-lg mx-4 bg-card border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un élève, une famille..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                autoComplete="off"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-muted transition-colors">
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.length < 2 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Tapez au moins 2 caractères pour rechercher
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Aucun résultat pour « {query} »
                </div>
              ) : (
                <div className="py-2">
                  {results.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors group"
                    >
                      {iconForType(r.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.sublabel}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                        {r.type === 'eleve' ? 'Élève' : 'Famille'}
                      </span>
                      <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span><kbd className="font-mono bg-background border rounded px-1">↑↓</kbd> naviguer</span>
              <span><kbd className="font-mono bg-background border rounded px-1">↵</kbd> ouvrir</span>
              <span><kbd className="font-mono bg-background border rounded px-1">esc</kbd> fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
