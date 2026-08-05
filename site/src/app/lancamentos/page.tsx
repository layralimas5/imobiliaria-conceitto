import type { Metadata } from 'next';
import { developmentRepository } from '@/data/development-catalog';
import { STAGE_LABELS } from '@/domain/development';
import { DevelopmentCard } from '@/components/development/development-card';
import { LeadForm } from '@/components/property/lead-form';

export const metadata: Metadata = {
  title: 'Lançamentos',
  description:
    'Empreendimentos em lançamento e em obras comercializados pela Imobiliária Conceitto em Farroupilha, Bento Gonçalves e Torres.',
  alternates: { canonical: '/lancamentos' },
};

export default async function LancamentosPage() {
  const developments = await developmentRepository.all();

  const stagesInUse = [...new Set(developments.map((development) => development.stage))];
  const cities = [
    ...new Set(developments.map((development) => development.location.city)),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

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
          Empreendimentos com condição de lançamento, plantas, tabela de valores e visita
          acompanhada por um corretor da casa. Hoje são {developments.length}{' '}
          {developments.length === 1 ? 'projeto' : 'projetos'} em{' '}
          {cities.join(', ').replace(/, ([^,]*)$/, ' e $1')}.
        </p>

        {stagesInUse.length > 1 ? (
          <ul className="mt-7 flex flex-wrap gap-2">
            {stagesInUse.map((stage) => (
              <li
                key={stage}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs uppercase tracking-wider text-ink-soft"
              >
                {STAGE_LABELS[stage]}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {developments.map((development, index) => (
          <li key={development.slug} className="flex">
            <DevelopmentCard
              development={development}
              priority={index < 3}
              className="w-full"
            />
          </li>
        ))}
      </ul>

      <section className="mt-20 grid gap-10 rounded-card border border-line bg-surface p-8 shadow-card md:p-12 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div>
          <p className="text-eyebrow">Antes de todo mundo</p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">
            Avisamos você quando abrir
            <br />
            um lançamento novo.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
            As melhores unidades saem na fase de pré-lançamento, antes de qualquer anúncio.
            Deixe seu contato e um corretor avisa você primeiro.
          </p>
        </div>
        <div>
          <LeadForm defaultIntent="informacoes" />
        </div>
      </section>
    </div>
  );
}
