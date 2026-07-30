import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as WouterLink } from 'wouter';

type NextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
  replace?: boolean;
  prefetch?: boolean;
};

/** Shim de next/link para Vite / wouter. */
export default function Link({ href, children, className, ...rest }: NextLinkProps) {
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <WouterLink href={href} className={className} {...rest}>
      {children}
    </WouterLink>
  );
}
