export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`h-${i}`} className="h-4 bg-muted rounded w-3/4" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-card rounded-xl border p-5 space-y-3">
      <div className="h-4 bg-muted rounded w-1/3" />
      <div className="h-6 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-1/4" />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="kpi-card animate-pulse">
      <div className="rounded-xl p-3 bg-muted h-11 w-11" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}
