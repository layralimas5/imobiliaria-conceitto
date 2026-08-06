import type { Metadata } from 'next';
import { LeadForm } from '@/components/property/lead-form';
import { BRANCHES, SITE, whatsappLink } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a Imobiliária Conceitto em Farroupilha ou Bento Gonçalves. Telefone, WhatsApp, endereço e formulário de contato.',
  alternates: { canonical: '/contato' },
};

export default function ContatoPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow">Contato</p>
        <h1 className="text-display mt-4 text-5xl md:text-6xl">Vamos conversar</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Escolha a unidade mais perto de você ou mande uma mensagem. Respondemos em
          horário comercial, normalmente no mesmo dia.
        </p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_26rem] lg:gap-20">
        <div className="space-y-6">
          {BRANCHES.map((branch) => (
            <section
              key={branch.id}
              className="rounded-card border border-line bg-surface p-7 shadow-card"
            >
              <p className="text-eyebrow">{branch.name}</p>
              <h2 className="text-display mt-2 text-2xl">{branch.city}</h2>
              <address className="mt-4 not-italic text-sm leading-relaxed text-ink-soft">
                {branch.street}
                <br />
                {branch.district}, {branch.city} — RS
              </address>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <a
                  href={`tel:+55${branch.phone.replace(/\D/g, '')}`}
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-line-strong"
                >
                  {branch.phone}
                </a>
                <a
                  href={whatsappLink({ city: branch.id, operation: 'venda' })}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  WhatsApp vendas
                </a>
                <a
                  href={whatsappLink({ city: branch.id, operation: 'locacao' })}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-line-strong"
                >
                  WhatsApp locação
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapsQuery)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline-offset-4 hover:underline"
                >
                  Ver no mapa
                </a>
                <a
                  href={branch.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline-offset-4 hover:underline"
                >
                  Instagram
                </a>
                <a
                  href={branch.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline-offset-4 hover:underline"
                >
                  Facebook
                </a>
              </div>
            </section>
          ))}

          <p className="text-sm text-ink-faint">
            {SITE.legalName} — CNPJ {SITE.cnpj} — {SITE.creci}
          </p>
        </div>

        <div className="rounded-card border border-line bg-surface p-7 shadow-card lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-display text-2xl">Mandar mensagem</h2>
          <LeadForm className="mt-6" defaultIntent="informacoes" />
        </div>
      </div>
    </div>
  );
}
