'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Menu, Phone, User, X } from 'lucide-react';
import { BRANCHES, NAV_LINKS } from '@/lib/site-config';
import { ClientLogin } from '@/components/layout/client-login';

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headOffice = BRANCHES[0];

  /*
   * Pages that open on a full-bleed hero let the banner run under the header.
   * That needs a logo that survives dark footage, which `logo-branco.png` is:
   * the ink is repainted white and the counter inside the "C" is knocked out,
   * so the mark is drawn by the video showing through it.
   */
  const hasImmersiveHero = pathname === '/' || pathname.startsWith('/lancamentos');
  const isTransparent = hasImmersiveHero && !isScrolled && !isOpen;

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
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color,color] duration-300 ${
        isTransparent
          ? 'border-transparent bg-transparent text-white'
          : isScrolled
            ? 'border-line/60 bg-paper/60 text-ink shadow-sm backdrop-blur-2xl backdrop-saturate-150'
            : 'border-line/70 bg-paper text-ink'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          aria-label="Conceitto, página inicial"
          className="relative block h-6 w-[7.6rem] shrink-0 md:h-7 md:w-[8.4rem]"
        >
          {/* Both marks stay mounted and cross-fade; swapping `src` would blink. */}
          <Image
            src="/imagens/logo.png"
            alt="Imobiliária Conceitto"
            fill
            priority
            sizes="150px"
            className={`object-contain object-left transition-opacity duration-300 ${
              isTransparent ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/imagens/logo-branco.png"
            alt=""
            aria-hidden
            fill
            priority
            sizes="150px"
            className={`object-contain object-left transition-opacity duration-300 ${
              isTransparent ? 'opacity-100' : 'opacity-0'
            }`}
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
                        className={`absolute inset-x-0 -bottom-0.5 h-px ${
                          isTransparent ? 'bg-white' : 'bg-brand-600'
                        }`}
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
            className={`inline-flex size-10 items-center justify-center rounded-full transition-colors ${
              isTransparent
                ? 'text-white/85 hover:bg-white/15 hover:text-white'
                : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
            }`}
          >
            <Phone className="size-[1.15rem]" aria-hidden />
          </a>

          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            aria-haspopup="dialog"
            aria-label="Entrar na área do cliente"
            title="Área do cliente"
            className={`inline-flex size-10 items-center justify-center rounded-full transition-colors ${
              isTransparent
                ? 'text-white/85 hover:bg-white/15 hover:text-white'
                : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
            }`}
          >
            <User className="size-[1.15rem]" aria-hidden />
          </button>

          {/* The team's own way in. Next to the client icon because they are the
              same kind of thing — a door out of the site and into a panel. */}
          <Link
            href="/sistema"
            aria-label="Abrir o sistema da imobiliária"
            title="Sistema"
            className={`inline-flex size-10 items-center justify-center rounded-full transition-colors ${
              isTransparent
                ? 'text-white/85 hover:bg-white/15 hover:text-white'
                : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
            }`}
          >
            <LayoutGrid className="size-[1.15rem]" aria-hidden />
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            className={`inline-flex size-10 items-center justify-center rounded-full transition-colors lg:hidden ${
              isTransparent ? 'hover:bg-white/15' : 'hover:bg-black/5'
            }`}
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
          </nav>
        </div>
      ) : null}

      {isLoginOpen ? <ClientLogin onClose={() => setIsLoginOpen(false)} /> : null}
    </header>
  );
}
