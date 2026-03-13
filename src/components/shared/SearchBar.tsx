import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounce?: number;
}

export function SearchBar({ placeholder = 'Rechercher...', onSearch, debounce = 300 }: SearchBarProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), debounce);
    return () => clearTimeout(timer);
  }, [value, debounce, onSearch]);

  return (
    <div className="flex items-center gap-2 bg-card border rounded-xl px-3.5 py-2.5 w-full max-w-sm shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
      <Search size={18} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}
