import { LEAD_INTENT_LABELS, type Lead } from '@/domain/lead';
import { propertyPath, type Property } from '@/domain/property';
import { developmentPath, type Development } from '@/domain/development';
import { branchFor, SITE, type Branch } from '@/lib/site-config';
import {
  leadDeliveryConfig,
  siteOrigin,
  type EmailChannelConfig,
  type WebhookChannelConfig,
} from '@/lib/env';

/** What the lead was looking at when it submitted, resolved server-side. */
export interface LeadContext {
  readonly property: Property | null;
  readonly development: Development | null;
}

export type ChannelName = 'email' | 'webhook';

export interface ChannelResult {
  readonly channel: ChannelName;
  readonly ok: boolean;
  readonly detail?: string;
}

export interface DeliveryOutcome {
  /** False only when a configured channel exists and every one of them failed. */
  readonly ok: boolean;
  /** True when no channel is configured — the lead was logged, not delivered. */
  readonly unconfigured: boolean;
  readonly results: readonly ChannelResult[];
}

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Sends the lead through every configured channel.
 *
 * Channels run in parallel and independently: the webhook failing must not stop
 * the e-mail. The outcome is `ok` when at least one configured channel
 * succeeded, because the broker only needs to receive the lead once.
 */
export async function deliverLead(
  lead: Lead,
  context: LeadContext,
): Promise<DeliveryOutcome> {
  const config = leadDeliveryConfig();
  const branch = branchForLead(context);

  const tasks: Array<Promise<ChannelResult>> = [];
  if (config.email) tasks.push(sendEmail(config.email, lead, context, branch));
  if (config.webhook) tasks.push(sendWebhook(config.webhook, lead, context, branch));

  if (tasks.length === 0) {
    return { ok: true, unconfigured: true, results: [] };
  }

  const results = await Promise.all(tasks);
  return {
    ok: results.some((result) => result.ok),
    unconfigured: false,
    results,
  };
}

/** Routes by the city of whatever the visitor was looking at, head office otherwise. */
export function branchForLead(context: LeadContext): Branch {
  const citySlug =
    context.property?.address.citySlug ?? context.development?.location.citySlug;
  return branchFor(citySlug);
}

function recipientFor(config: EmailChannelConfig, branch: Branch): string {
  const perBranch =
    branch.id === 'bento-goncalves' ? config.toBentoGoncalves : config.toFarroupilha;
  return perBranch ?? config.to;
}

async function sendEmail(
  config: EmailChannelConfig,
  lead: Lead,
  context: LeadContext,
  branch: Branch,
): Promise<ChannelResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: [recipientFor(config, branch)],
        reply_to: lead.email,
        subject: emailSubject(lead, context),
        html: emailHtml(lead, context, branch),
        text: emailText(lead, context, branch),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return {
        channel: 'email',
        ok: false,
        detail: `HTTP ${response.status} ${body.slice(0, 300)}`,
      };
    }
    return { channel: 'email', ok: true };
  } catch (error) {
    return { channel: 'email', ok: false, detail: messageOf(error) };
  }
}

async function sendWebhook(
  config: WebhookChannelConfig,
  lead: Lead,
  context: LeadContext,
  branch: Branch,
): Promise<ChannelResult> {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(config.token ? { authorization: config.token } : {}),
      },
      body: JSON.stringify({
        source: 'site',
        receivedAt: new Date().toISOString(),
        branch: { id: branch.id, city: branch.city },
        lead: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          intent: lead.intent,
          message: lead.message ?? null,
        },
        property: context.property
          ? {
              code: context.property.code,
              title: context.property.title,
              url: `${siteOrigin()}${propertyPath(context.property)}`,
            }
          : null,
        development: context.development
          ? {
              slug: context.development.slug,
              name: context.development.name,
              url: `${siteOrigin()}${developmentPath(context.development)}`,
            }
          : null,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { channel: 'webhook', ok: false, detail: `HTTP ${response.status}` };
    }
    return { channel: 'webhook', ok: true };
  } catch (error) {
    return { channel: 'webhook', ok: false, detail: messageOf(error) };
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function emailSubject(lead: Lead, context: LeadContext): string {
  if (context.property) {
    return `Lead ${context.property.code} — ${lead.name} (${LEAD_INTENT_LABELS[lead.intent]})`;
  }
  if (context.development) {
    return `Lead ${context.development.name} — ${lead.name}`;
  }
  return `Lead do site — ${lead.name} (${LEAD_INTENT_LABELS[lead.intent]})`;
}

/** Digits only, so the broker can tap the number straight from the phone. */
function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/55${digits}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface ContextLine {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}

function contextLines(lead: Lead, context: LeadContext, branch: Branch): ContextLine[] {
  const origin = siteOrigin();
  const lines: ContextLine[] = [
    { label: 'Nome', value: lead.name },
    { label: 'WhatsApp', value: lead.phone, href: whatsappHref(lead.phone) },
    { label: 'E-mail', value: lead.email, href: `mailto:${lead.email}` },
    { label: 'Assunto', value: LEAD_INTENT_LABELS[lead.intent] },
    { label: 'Unidade', value: branch.label },
  ];

  if (context.property) {
    lines.push({
      label: `Imóvel ${context.property.code}`,
      value: context.property.title,
      href: `${origin}${propertyPath(context.property)}`,
    });
  } else if (lead.propertyCode) {
    // The listing left the catalog between the visit and the submit.
    lines.push({ label: 'Imóvel', value: `código ${lead.propertyCode}` });
  }

  if (context.development) {
    lines.push({
      label: 'Empreendimento',
      value: context.development.name,
      href: `${origin}${developmentPath(context.development)}`,
    });
  }

  if (lead.message) lines.push({ label: 'Mensagem', value: lead.message });

  return lines;
}

function emailHtml(lead: Lead, context: LeadContext, branch: Branch): string {
  const rows = contextLines(lead, context, branch)
    .map(({ label, value, href }) => {
      const content = href
        ? `<a href="${escapeHtml(href)}" style="color:#166534;text-decoration:underline">${escapeHtml(value)}</a>`
        : escapeHtml(value);
      return `<tr>
        <td style="padding:6px 16px 6px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#111827;font-size:14px">${content}</td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f5f5f4;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;border-collapse:separate">
    <tr><td style="padding:24px 24px 8px">
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">${escapeHtml(SITE.name)}</p>
      <h1 style="margin:6px 0 0;font-size:18px;color:#111827">Novo contato pelo site</h1>
    </td></tr>
    <tr><td style="padding:8px 24px 24px">
      <table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table>
    </td></tr>
    <tr><td style="padding:0 24px 24px">
      <a href="${escapeHtml(whatsappHref(lead.phone))}" style="display:inline-block;background:#166534;color:#ffffff;font-size:14px;text-decoration:none;padding:11px 20px;border-radius:8px">Responder no WhatsApp</a>
    </td></tr>
  </table>
</body></html>`;
}

function emailText(lead: Lead, context: LeadContext, branch: Branch): string {
  const body = contextLines(lead, context, branch)
    .map(({ label, value, href }) => `${label}: ${value}${href ? `\n  ${href}` : ''}`)
    .join('\n');
  return `Novo contato pelo site da ${SITE.name}\n\n${body}\n`;
}
