import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '-';
    return format(d, 'd MMMM yyyy', { locale: fr });
  } catch {
    return '-';
  }
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '-';
    return format(d, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '-';
  }
}
