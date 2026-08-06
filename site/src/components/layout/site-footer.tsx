import Link from 'next/link';
import { BRANCHES, NAV_LINKS, SITE } from '@/lib/site-config';
import { FacebookIcon, InstagramIcon } from '@/components/layout/social-icons';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-brand-900 text-brand-50">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-display text-3xl text-white">Conceitto</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100/80">
            Imóveis na Serra Gaúcha desde {SITE.foundedYear}. Compra, venda, locação e
            administração com quem conhece cada bairro da região.
          </p>
          <p className="mt-6 text-xs text-brand-100/60">{SITE.creci}</p>

          <ul className="mt-4 space-y-2.5">
            {BRANCHES.map((branch) => (
              <li key={branch.id} className="flex items-center gap-3">
                <span className="w-32 text-xs text-brand-100/55">{branch.city}</span>
                <a
                  href={branch.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Instagram da unidade ${branch.city}`}
                  className="text-brand-100/70 transition-colors hover:text-white"
                >
                  <InstagramIcon />
                </a>
                <a
                  href={branch.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Facebook da unidade ${branch.city}`}
                  className="text-brand-100/70 transition-colors hover:text-white"
                >
                  <FacebookIcon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="text-eyebrow text-brand-100/60">Navegar</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-brand-100/85 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
          {BRANCHES.map((branch) => (
            <address key={branch.id} className="not-italic">
              <h2 className="text-eyebrow text-brand-100/60">{branch.city}</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-100/85">
                {branch.street}
                <br />
                {branch.district}
              </p>
              <a
                href={`tel:+55${branch.phone.replace(/\D/g, '')}`}
                className="mt-2 inline-block text-sm text-white transition-colors hover:text-bronze-100"
              >
                {branch.phone}
              </a>
            </address>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-brand-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name} — CNPJ {SITE.cnpj}
          </p>
          <p>
            Desenvolvido por <strong className="font-medium text-brand-100/80">Layra Lima</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
