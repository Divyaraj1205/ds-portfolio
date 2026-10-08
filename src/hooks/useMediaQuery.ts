import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  // Read the real value on first render (this is a client-only app) instead
  // of starting at false -- that caused an immediate second render on
  // desktop and briefly laid out How I Work in its mobile arrangement.
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
