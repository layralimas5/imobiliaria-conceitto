import Image from 'next/image';
import type { Development } from '@/domain/development';
import { formatPrice } from '@/lib/format';
import { branchFor, developmentWhatsapp } from '@/lib/site-config';
import { LeadForm } from '@/components/property/lead-form';

interface DevelopmentContactProps {
  development: Development;
}

export function DevelopmentContact({ development }: DevelopmentContactProps) {
  const branch = branchFor(development.location.citySlug);
  const { agent } = development;

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card lg:sticky lg:top-36">
      <div className="border-b border-line pb-5">
        <p className="text-eyebrow">
          {development.priceFrom !== null ? 'Unidades a partir de' : 'Investimento'}
        </p>
        <p className="mt-1 text-3xl font-medium tracking-tight">
          {formatPrice(development.priceFrom)}
        </p>
        {development.deliveryLabel ? (
          <p className="mt-2 text-sm text-ink-soft">{development.deliveryLabel}</p>
        ) : null}
      </div>

      <a
        href={developmentWhatsapp(development)}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        Falar no WhatsApp
      </a>
      <a
        href={`tel:+55${branch.phone.replace(/\D/g, '')}`}
        className="mt-2.5 flex h-12 w-full items-center justify-center rounded-lg border border-line text-sm font-medium transition-colors hover:border-line-strong"
      >
        {branch.phone}
      </a>
      <p className="mt-4 text-center text-xs text-ink-faint">
        Atendimento pela unidade {branch.city}
      </p>

      {agent ? (
        <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
          {agent.photoUrl ? (
            <Image
              src={agent.photoUrl}
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-surface-muted text-sm font-medium text-ink-faint"
            >
              {agent.name.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{agent.name}</p>
            <p className="text-xs text-ink-faint">CRECI {agent.creci}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-line pt-6">
        <h3 className="text-sm font-medium">Receber plantas e tabela</h3>
        <p className="mt-1 text-xs text-ink-faint">
          Um corretor envia o material completo por WhatsApp ou e-mail.
        </p>
        <LeadForm
          className="mt-5"
          developmentSlug={development.slug}
          defaultIntent="informacoes"
        />
      </div>
    </div>
  );
}
