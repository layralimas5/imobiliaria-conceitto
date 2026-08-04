import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LeadForm } from '@/components/property/lead-form';

export const metadata: Metadata = {
  title: 'Lançamentos',
  description:
    'Empreendimentos em lançamento e em obras comercializados pela Imobiliária Conceitto na Serra Gaúcha.',
  alternates: { canonical: '/lancamentos' },
};

/**
 * Placeholder until the client hands over the launch material. The Alba
 * development currently lives on a third-party subdomain; bringing it in here
 * is what keeps the SEO on the Conceitto domain.
 */
export default function LancamentosPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <header className="max-w-3xl">
        <p className="text-eyebrow">Lançamentos</p>
        <h1 className="text-display mt-4 text-5xl md:text-6xl">
          Da planta à chave
          <br />
          na mão.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          Comercializamos empreendimentos na Serra Gaúcha com condição de lançamento,
          plantas, tabela de valores e visita ao decorado.
        </p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_26rem] lg:gap-20">
        <section className="rounded-card border border-dashed border-line-strong bg-surface p-10 text-center">
          <h2 className="text-display text-3xl">Empreendimentos em breve aqui</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            Esta página vai receber uma landing page própria para cada lançamento, com
            galeria, plantas, diferenciais e formulário direto com o corretor responsável.
          </p>
          <Link
            href="/contato"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-forest-600"
          >
            Falar sobre lançamentos
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        <div className="rounded-card border border-line bg-surface p-7 shadow-card lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-display text-2xl">Quero ser avisado</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Deixe seu contato e avisamos assim que abrir um lançamento novo.
          </p>
          <LeadForm className="mt-6" defaultIntent="informacoes" />
        </div>
      </div>
    </div>
  );
}
