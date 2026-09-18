import type { ElementType, ReactNode } from 'react';
import { useInView } from '../lib/useInView';

interface RevealProps {
  children: ReactNode;
  /** Stagger, in milliseconds, for items revealed as a group. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Content that arrives as it is scrolled to.
 *
 * The transition itself lives in `theme.css` under `[data-reveal]`, so the
 * reduced-motion block can land it in one place rather than per component.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      data-reveal={inView ? 'shown' : 'hidden'}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
