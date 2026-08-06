import type { Metadata } from 'next';
import { Camera, ClipboardCheck, HandCoins, Megaphone } from 'lucide-react';
import { SubmissionForm } from '@/components/property/submission-form';

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
                className="rounded-card border border-line bg-surface p-6 shadow-card"
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

          <section className="mt-12 rounded-card border border-line bg-surface-muted p-7">
            <h2 className="text-display text-2xl">Prefere alugar em vez de vender?</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Fazemos a administração completa: análise do inquilino, contrato, garantia,
              vistoria de entrada e saída, cobrança e repasse. Você recebe em dia sem
              precisar falar com ninguém.
            </p>
          </section>
        </div>

        <div
          id="cadastrar"
          className="scroll-mt-28 rounded-card border border-line bg-surface p-7 shadow-card md:p-8"
        >
          <h2 className="text-display text-3xl">Cadastrar meu imóvel</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Preencha o que souber e anexe as fotos que tiver. O que faltar a gente
            levanta na visita de avaliação.
          </p>
          <SubmissionForm className="mt-7" />
        </div>
      </div>
    </div>
  );
}
