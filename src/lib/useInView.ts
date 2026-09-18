import { useEffect, useRef, useState } from 'react';

/**
 * Has this element been scrolled into view yet?
 *
 * One-shot by design: it disconnects on the first intersection, so content never
 * animates out again on the way back up. A reader scrolling to re-read something
 * wants it there, not fading.
 *
 * Returns `true` immediately when IntersectionObserver is unavailable — in a
 * test environment, say — so absence of the API can never hide content.
 */
export function useInView<T extends Element>(rootMargin = '-12% 0px -8% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView } as const;
}
