import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { BreadcrumbJsonLd } from '@/components/Seo';

export type Crumb = { name: string; href: string };

type Props = {
  children: ReactNode;
  crumbs?: Crumb[];
};

/** Inner pages: breadcrumb trail and footer. The header is mounted once
 *  in the root layout, so it is identical on every route. */
export function PageShell({ children, crumbs }: Props) {
  return (
    <>
      {crumbs?.length ? <BreadcrumbJsonLd trail={crumbs} /> : null}
      <main className="pt-[104px] md:pt-[122px]">
        {crumbs?.length ? (
          <nav
            aria-label="Breadcrumb"
            className="mx-auto max-w-shell px-5 pt-7 text-[13px] text-muted md:px-14"
          >
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i < crumbs.length - 1 ? (
                    <>
                      <Link href={crumb.href} className="hover:text-accent">
                        {crumb.name}
                      </Link>
                      <span aria-hidden="true">/</span>
                    </>
                  ) : (
                    <span className="text-ink">{crumb.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {children}
      </main>
      <Footer />
    </>
  );
}
