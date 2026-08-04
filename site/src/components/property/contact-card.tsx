import Image from 'next/image';
import type { Operation, PropertyAgent, PropertyPricing } from '@/domain/property';
import { formatPrice } from '@/lib/format';
import { branchFor, whatsappLink } from '@/lib/site-config';
import { LeadForm } from '@/components/property/lead-form';

interface ContactCardProps {
  code: string;
  city: string;
  operations: readonly Operation[];
  pricing: PropertyPricing;
  agent: PropertyAgent | null;
}

export function ContactCard({
  code,
  city,
  operations,
  pricing,
  agent,
}: ContactCardProps) {
  const branch = branchFor(city);
  const primaryOperation: Operation = operations[0] ?? 'venda';

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="space-y-3 border-b border-line pb-5">
          {operations.includes('venda') ? (
            <div>
              <p className="text-eyebrow">Venda</p>
              <p className="mt-1 text-3xl font-medium tracking-tight">
                {formatPrice(pricing.salePrice)}
              </p>
            </div>
          ) : null}
          {operations.includes('locacao') ? (
            <div>
              <p className="text-eyebrow">Locação</p>
              <p className="mt-1 text-3xl font-medium tracking-tight">
                {formatPrice(pricing.rentPrice)}
                {pricing.rentPrice !== null ? (
                  <span className="text-base font-normal text-ink-faint">/mês</span>
                ) : null}
              </p>
            </div>
          ) : null}
        </div>

        <a
          href={whatsappLink({ city, operation: primaryOperation, propertyCode: code })}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-forest-700 text-sm font-medium text-white transition-colors hover:bg-forest-600"
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
      </div>

      <div className="mt-4 rounded-card border border-line bg-surface p-6 shadow-card">
        <h2 className="text-sm font-medium">Agendar uma visita</h2>
        <p className="mt-1 text-xs text-ink-faint">
          Respondemos em horário comercial, normalmente no mesmo dia.
        </p>
        <LeadForm propertyCode={code} className="mt-5" />
      </div>
    </aside>
  );
}
