import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;
export interface SortState {
  key: string;
  direction: SortDirection;
}

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: SortState;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHeader({ label, sortKey, currentSort, onSort, className = '' }: SortableTableHeaderProps) {
  const isActive = currentSort.key === sortKey;

  return (
    <th
      className={`sortable ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && currentSort.direction === 'asc' && <ArrowUp size={12} />}
        {isActive && currentSort.direction === 'desc' && <ArrowDown size={12} />}
        {!isActive && <ArrowUpDown size={12} className="opacity-30" />}
      </span>
    </th>
  );
}

export function toggleSort(current: SortState, key: string): SortState {
  if (current.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return { key: '', direction: null };
}

export function sortData<T>(data: T[], sort: SortState, getVal: (item: T, key: string) => any): T[] {
  if (!sort.key || !sort.direction) return data;
  return [...data].sort((a, b) => {
    const va = getVal(a, sort.key);
    const vb = getVal(b, sort.key);
    const dir = sort.direction === 'asc' ? 1 : -1;
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va ?? '').localeCompare(String(vb ?? ''), 'fr') * dir;
  });
}
