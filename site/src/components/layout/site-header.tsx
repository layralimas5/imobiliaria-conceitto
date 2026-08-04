'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, X } from 'lucide-react';
import { NAV_LINKS, whatsappLink } from '@/lib/site-config';

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled && !isOpen;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        isTransparent
          ? 'bg-transparent text-white'
          : 'border-b border-line bg-paper/85 text-ink backdrop-blur-md'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="text-display text-2xl tracking-tight md:text-[1.75rem]"
          aria-label="Conceitto, página inicial"
        >
          Conceitto
        </Link>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative py-1 transition-opacity hover:opacity-70 ${
                      isActive ? 'font-medium' : ''
                    }`}
                  >
                    {link.label}
                    {isActive ? (
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 -bottom-0.5 h-px ${
                          isTransparent ? 'bg-white' : 'bg-forest-600'
                        }`}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={whatsappLink({})}
            target="_blank"
            rel="noreferrer noopener"
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:inline-flex ${
              isTransparent
                ? 'bg-white/12 text-white ring-1 ring-white/25 hover:bg-white/20'
                : 'bg-forest-700 text-white hover:bg-forest-600'
            }`}
          >
            <Phone className="size-4" aria-hidden />
            Falar com corretor
          </a>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 lg:hidden"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div
          id="menu-mobile"
          className="border-t border-line bg-paper text-ink lg:hidden"
        >
          <nav aria-label="Navegação principal (mobile)" className="container-page py-6">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-3 text-lg transition-colors hover:bg-surface-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={whatsappLink({})}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-sm font-medium text-white"
            >
              <Phone className="size-4" aria-hidden />
              Falar com corretor
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
