import type { Metadata } from 'next';
import Image from 'next/image';
import { Camera, ClipboardCheck, HandCoins, Megaphone, MessageCircle } from 'lucide-react';
import { SubmissionForm } from '@/components/property/submission-form';
import { LeadForm } from '@/components/property/lead-form';
import { heroImage } from '@/lib/local-media';
import { whatsappLink } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Anuncie seu imóvel',
  description:
    'Avaliação gratuita, fotografia profissional e divulgação no site, nos portais e nas redes. Anuncie seu imóvel com a Imobiliária Conceitto.',
  alternates: { canonical: '/anuncie' },
};

const STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Avaliação',
    text: 'Visitamos o imóvel e definimos o preço por comparativo real do bairro, sem chute e sem compromisso.',
  },
  {
    icon: Camera,
    title: 'Fotografia',
    text: 'Fotógrafo próprio, em horário de boa luz. É o que separa um anúncio que para o dedo de um que passa batido.',
  },
  {
    icon: Megaphone,
    title: 'Divulgação',
    text: 'Site, portais, redes sociais e a carteira ativa de clientes das duas lojas.',
  },
  {
    icon: HandCoins,
    title: 'Negociação',
    text: 'Filtramos curioso de comprador, conduzimos a proposta e cuidamos da papelada até a assinatura.',
  },
];

export default function AnunciePage() {
  const banner = heroImage();

  return (
    <div className="container-page py-14 md:py-20">
      <div className="grid gap-14 lg:grid-cols-[1fr_34rem] lg:gap-20">
        <div>
          <header className="max-w-2xl">
            <p className="text-eyebrow">Para proprietários</p>
            <h1 className="text-display mt-4 text-5xl md:text-6xl">
              Seu imóvel anunciado
              <br />
              do jeito certo.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Avaliação sem custo, fotos profissionais e divulgação ampla. Você acompanha
              cada etapa e decide sobre cada proposta.
            </p>
            <a
              href="#cadastrar"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600 lg:hidden"
            >
              Cadastrar meu imóvel
            </a>
          </header>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="pulse-on-hover rounded-card border border-line bg-surface p-6 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <step.icon className="size-5 text-brand-600" aria-hidden />
                  <span className="text-xs font-medium text-ink-faint">
                    Etapa {index + 1}
                  </span>
                </div>
                <h2 className="mt-4 font-medium">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>

          {/*
           * The banner, blurred past legibility and washed in the brand red —
           * the same treatment the home page gives its cities block. It reads
           * as a field of colour rather than a photograph, which is why the
           * copy on top flips to white.
           */}
          <section className="relative mt-12 overflow-hidden rounded-card p-7">
            {banner ? (
              <Image
                src={banner}
                alt=""
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                // Overscaled: a blur samples past the edges and would otherwise
                // feather into transparency at the section's borders.
                className="scale-110 object-cover blur-2xl"
              />
            ) : null}
            <div aria-hidden className="absolute inset-0 bg-brand-900/85" />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-brand-700/40 via-transparent to-brand-900/60"
            />

            <div className="relative">
              <h2 className="text-display text-2xl text-white">
                Prefere alugar em vez de vender?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Fazemos a administração completa: análise do inquilino, contrato,
                garantia, vistoria de entrada e saída, cobrança e repasse. Você recebe em
                dia sem precisar falar com ninguém.
              </p>
            </div>
          </section>
        </div>

        <div
          id="cadastrar"
          className="scroll-mt-28 rounded-card border border-line bg-surface p-7 shadow-soft md:p-8"
        >
          <h2 className="text-display text-3xl">Cadastrar meu imóvel</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Preencha o que souber e anexe as fotos que tiver. O que faltar a gente
            levanta na visita de avaliação.
          </p>
          <SubmissionForm className="mt-7" />
        </div>
      </div>

      {/* Atendimento Conceitto — the same block that closes /lancamentos, for
          the owner who would rather be called than fill in the long form. */}
      <section className="mt-24 grid gap-12 border-t border-line pt-16 md:mt-32 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-bronze-600">
            Atendimento Conceitto
          </p>
          <span aria-hidden className="mt-2 block h-px w-12 bg-bronze-400" />

          <h2 className="text-display mt-6 text-4xl md:text-5xl">
            Prefere conversar
            <br />
            <span className="text-bronze-600">antes</span> de cadastrar?
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Deixe seus dados e um corretor liga no horário que você escolher, para
            avaliar o imóvel e explicar como funciona a administração.
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

        <LeadForm defaultIntent="anunciar" variant="launch" />
      </section>
    </div>
  );
}
