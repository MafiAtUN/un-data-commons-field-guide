import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { url } from '../lib/paths';

/**
 * An internal link on a guide page.
 *
 * The guide pages were written for a single-page app and link by route, often
 * by their old address ("/cookbook"). Every page is its own HTML file now, so a
 * link is an ordinary anchor, with the base path added and an old address
 * translated to where that page lives today.
 */
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  children?: ReactNode;
};

export function Link({ to, ...rest }: Props) {
  return <a href={url(to)} {...rest} />;
}
