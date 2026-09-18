import { useEffect } from 'react';

/** Wires ⌘K / Ctrl+K to a piece of state. */
export function usePaletteHotkey(onOpen: () => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpen();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpen]);
}

/** `⌘K` on a Mac, `Ctrl K` everywhere else. Guessed from the platform string. */
export function paletteHint(): string {
  if (typeof navigator === 'undefined') return 'Ctrl K';
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
}
