'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, User, X } from 'lucide-react';
import { BRANCHES, NAV_LINKS, SITE, whatsappLink } from '@/lib/site-config';

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headOffice = BRANCHES[0];

  /*
   * The header used to go transparent over the full-bleed heroes. It no longer
   * does: the logo is a bitmap with a flat plate baked in and hairline type, so
   * it cannot be keyed onto dark photography without ghosting, and a knockout
   * flattens the "C" mark into a solid block. A white or vector logo from the
   * client brings the immersive header back — see briefing.md.
   */
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

  // Escape closes the menu, and focus goes back to the button that opened it —
  // the panel covers the page, so leaving focus behind it strands the keyboard.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header
      /*
       * Solid at rest, frosted once the page moves. The blur is what carries
       * the effect, so the fill has to stay genuinely translucent — a 95%
       * white plate reads as a flat bar no matter how much blur sits behind it.
       */
      className={`sticky top-0 z-40 border-b text-ink transition-[background-color,box-shadow,border-color] duration-300 ${
        isScrolled
          ? 'border-line bg-paper/70 shadow-sm backdrop-blur-2xl backdrop-saturate-150'
          : 'border-line/70 bg-paper'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Link href="/" aria-label="Conceitto, página inicial" className="shrink-0">
          <Image
            src="/imagens/logo.png"
            alt="Imobiliária Conceitto"
            width={291}
            height={63}
            priority
            className="h-8 w-auto md:h-9"
          />
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
                        className="absolute inset-x-0 -bottom-0.5 h-px bg-brand-600"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/*
           * The head office answers anything not tied to a city, which is the
           * same rule `branchFor(undefined)` applies everywhere else on the site.
           */}
          <a
            href={`tel:+55${headOffice.phone.replace(/\D/g, '')}`}
            aria-label={`Ligar para a unidade ${headOffice.city}, ${headOffice.phone}`}
            title={`${headOffice.city} · ${headOffice.phone}`}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <Phone className="size-[1.15rem]" aria-hidden />
          </a>

          <a
            href={SITE.clientAreaUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Entrar no sistema, área do cliente"
            title="Entrar no sistema"
            className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <User className="size-[1.15rem]" aria-hidden />
          </a>

          <a
            href={whatsappLink({})}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-1 hidden items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:inline-flex"
          >
            Falar com corretor
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 lg:hidden"
          >
            {isOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
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
                    aria-current={pathname === link.href ? 'page' : undefined}
                    className="block rounded-lg px-3 py-3 text-lg transition-colors hover:bg-surface-muted aria-[current=page]:font-medium aria-[current=page]:text-brand-700"
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
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white"
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
