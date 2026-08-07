'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { WhatsappFab } from '@/components/layout/whatsapp-fab';

/**
 * Decides whether a page wears the public site's chrome.
 *
 * `/sistema` is a back office, not a page of the website: it brings its own
 * sidebar and bar, and stacking the site header, footer and the floating
 * WhatsApp button on top would leave someone unsure which of the two they are
 * looking at. Doing this here — rather than by moving every public route into a
 * layout group — keeps the app directory readable.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/sistema')) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsappFab />
    </>
  );
}
