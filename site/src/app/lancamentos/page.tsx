import type { Metadata } from 'next';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { developmentRepository } from '@/data/development-catalog';
import { STAGE_LABELS } from '@/domain/development';
import { DevelopmentFeature } from '@/components/development/development-feature';
import { LeadForm } from '@/components/property/lead-form';
import { heroImage } from '@/lib/local-media';
import { whatsappLink } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Lançamentos',
  description:
    'Empreendimentos em lançamento e em obras comercializados pela Imobiliária Conceitto em Farroupilha, Bento Gonçalves e Torres.',
  alternates: { canonical: '/lancamentos' },
};

export default async function LancamentosPage() {
  const developments = await developmentRepository.all();
  const banner = heroImage();

  const stagesInUse = [...new Set(developments.map((development) => development.stage))];
  const cities = [
    ...new Set(developments.map((development) => development.location.city)),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return (
    <>
      {/*
       * The banner runs under the header, the same way the home page and each
       * launch page open. `SiteHeader` turns transparent for anything under
       * `/lancamentos`, so the negative top margin pulls the image up behind it.
       */}
      <section className="relative -mt-16 flex min-h-[30rem] items-end overflow-hidden md:-mt-20 md:min-h-[36rem]">
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-900" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/45 to-ink/55"
        />

        <div className="container-page relative w-full pb-14 pt-32 md:pb-20 md:pt-40">
          <header className="max-w-3xl [text-shadow:0_1px_16px_rgb(20_21_15_/_0.45)]">
            <p className="text-eyebrow text-white/70">Lançamentos</p>
            <h1 className="text-display mt-4 text-5xl text-white md:text-6xl">
              Da planta à chave
              <br />
              na mão.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90">
              Empreendimentos com condição de lançamento, plantas, tabela de valores e
              visita acompanhada por um corretor da casa. Hoje são {developments.length}{' '}
              {developments.length === 1 ? 'projeto' : 'projetos'} em{' '}
              {cities.join(', ').replace(/, ([^,]*)$/, ' e $1')}.
            </p>

            {stagesInUse.length > 1 ? (
              <ul className="mt-7 flex flex-wrap gap-2">
                {stagesInUse.map((stage) => (
                  <li
                    key={stage}
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs uppercase tracking-wider text-white/85 backdrop-blur-sm"
                  >
                    {STAGE_LABELS[stage]}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>
        </div>
      </section>

      <div className="container-page py-14 md:py-20">
        <div className="space-y-24 md:space-y-32">
          {developments.map((development, index) => (
            <DevelopmentFeature
              key={development.slug}
              development={development}
              reversed={index % 2 === 1}
              priority={index === 0}
            />
          ))}
        </div>

        <section className="mt-24 grid gap-12 border-t border-line pt-16 md:mt-32 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-bronze-600">
              Atendimento Conceitto
            </p>
            <span aria-hidden className="mt-2 block h-px w-12 bg-bronze-400" />

            <h2 className="text-display mt-6 text-4xl md:text-5xl">
              Conheça todos os detalhes
              <br />
              dos <span className="text-bronze-600">lançamentos</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Preencha seus dados e receba plantas, tabela de valores e condição de
              lançamento com o atendimento exclusivo da Imobiliária Conceitto.
            </p>

            <a
              href={whatsappLink({ operation: 'venda' })}
              target="_blank"
              rel="noreferrer noopener"
              className="pulse-on-hover-tight mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-bronze-600 px-6 text-sm font-medium text-white transition-colors hover:bg-bronze-400 hover:text-ink"
            >
              <MessageCircle className="size-4" aria-hidden />
              Fale com nossos corretores
            </a>
          </div>

          <LeadForm defaultIntent="informacoes" variant="launch" />
        </section>
      </div>
    </>
  );
}
