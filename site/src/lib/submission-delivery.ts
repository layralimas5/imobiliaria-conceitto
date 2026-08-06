import { TYPE_LABELS } from '@/domain/search';
import {
  OPERATION_INTENT_LABELS,
  type ListingSubmission,
} from '@/domain/listing-submission';
import { formatPrice } from '@/lib/format';
import { branchFor, SITE, type Branch } from '@/lib/site-config';
import { leadDeliveryConfig, siteOrigin } from '@/lib/env';
import { slugify } from '@/lib/format';

export interface SubmissionPhoto {
  readonly filename: string;
  readonly contentType: string;
  readonly bytes: Buffer;
}

export interface SubmissionOutcome {
  readonly ok: boolean;
  readonly unconfigured: boolean;
  readonly results: readonly { channel: string; ok: boolean; detail?: string }[];
}

const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Delivers an owner's property submission.
 *
 * This does **not** write into MSYS Imob. There is no write API — the CRM only
 * publishes outward, via the portal feed. So the submission lands with the team
 * (inbox and/or webhook) carrying everything needed to register it, and a human
 * creates the MSYS record. Anything else would be pretending at an integration
 * that does not exist.
 */
export async function deliverSubmission(
  submission: ListingSubmission,
  photos: readonly SubmissionPhoto[],
): Promise<SubmissionOutcome> {
  const config = leadDeliveryConfig();
  const branch = branchFor(slugify(submission.city));

  const tasks: Array<Promise<{ channel: string; ok: boolean; detail?: string }>> = [];

  if (config.email) {
    const recipient =
      (branch.id === 'bento-goncalves'
        ? config.email.toBentoGoncalves
        : config.email.toFarroupilha) ?? config.email.to;

    tasks.push(
      (async () => {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              authorization: `Bearer ${config.email!.apiKey}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              from: config.email!.from,
              to: [recipient],
              reply_to: submission.ownerEmail,
              subject: subjectFor(submission),
              html: htmlFor(submission, branch, photos.length),
              text: textFor(submission, branch, photos.length),
              attachments: photos.map((photo) => ({
                filename: photo.filename,
                content: photo.bytes.toString('base64'),
              })),
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
      })(),
    );
  }

  if (config.webhook) {
    tasks.push(
      (async () => {
        try {
          const response = await fetch(config.webhook!.url, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              ...(config.webhook!.token
                ? { authorization: config.webhook!.token }
                : {}),
            },
            body: JSON.stringify({
              source: 'site',
              kind: 'captacao',
              receivedAt: new Date().toISOString(),
              branch: { id: branch.id, city: branch.city },
              submission,
              // Photos ride the e-mail; the webhook gets the manifest so the
              // receiving system knows what to expect without a 15 MB payload.
              photos: photos.map((photo) => ({
                filename: photo.filename,
                contentType: photo.contentType,
                bytes: photo.bytes.length,
              })),
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
      })(),
    );
  }

  if (tasks.length === 0) return { ok: true, unconfigured: true, results: [] };

  const results = await Promise.all(tasks);
  return { ok: results.some((result) => result.ok), unconfigured: false, results };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function subjectFor(submission: ListingSubmission): string {
  return `Captação · ${TYPE_LABELS[submission.type]} em ${submission.neighborhood}, ${submission.city} — ${submission.ownerName}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rowsFor(
  submission: ListingSubmission,
  branch: Branch,
  photoCount: number,
): readonly (readonly [string, string])[] {
  const measure = (value: number | null, unit: string) =>
    value === null ? null : `${value} ${unit}`;

  return [
    ['Proprietário', submission.ownerName],
    ['WhatsApp', submission.ownerPhone],
    ['E-mail', submission.ownerEmail],
    ['Intenção', OPERATION_INTENT_LABELS[submission.operation]],
    ['Tipo', TYPE_LABELS[submission.type]],
    [
      'Endereço',
      [submission.street, submission.neighborhood, submission.city]
        .filter(Boolean)
        .join(', '),
    ],
    ['Área', measure(submission.area, 'm²')],
    ['Dormitórios', measure(submission.bedrooms, '')],
    ['Banheiros', measure(submission.bathrooms, '')],
    ['Vagas', measure(submission.parkingSpaces, '')],
    [
      'Valor pretendido',
      submission.priceExpectation === null
        ? 'Aguarda avaliação'
        : formatPrice(submission.priceExpectation),
    ],
    ['Unidade', branch.label],
    ['Fotos', photoCount === 0 ? 'Nenhuma enviada' : `${photoCount} em anexo`],
    ['Observações', submission.description ?? null],
  ].filter((row): row is [string, string] => row[1] !== null && row[1] !== '');
}

function htmlFor(
  submission: ListingSubmission,
  branch: Branch,
  photoCount: number,
): string {
  const rows = rowsFor(submission, branch, photoCount)
    .map(
      ([label, value]) => `<tr>
        <td style="padding:6px 16px 6px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#111827;font-size:14px">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join('');

  const phoneDigits = submission.ownerPhone.replace(/\D/g, '');

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f5f5f4;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;border-collapse:separate">
    <tr><td style="padding:24px 24px 8px">
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">${escapeHtml(SITE.name)}</p>
      <h1 style="margin:6px 0 0;font-size:18px;color:#111827">Novo imóvel cadastrado pelo site</h1>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280">Confira e cadastre no MSYS.</p>
    </td></tr>
    <tr><td style="padding:8px 24px 24px">
      <table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table>
    </td></tr>
    <tr><td style="padding:0 24px 24px">
      <a href="https://wa.me/55${phoneDigits}" style="display:inline-block;background:#af1917;color:#ffffff;font-size:14px;text-decoration:none;padding:11px 20px;border-radius:8px">Falar com o proprietário</a>
    </td></tr>
    <tr><td style="padding:0 24px 20px;color:#9ca3af;font-size:11px">Enviado por ${escapeHtml(siteOrigin())}</td></tr>
  </table>
</body></html>`;
}

function textFor(
  submission: ListingSubmission,
  branch: Branch,
  photoCount: number,
): string {
  const body = rowsFor(submission, branch, photoCount)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
  return `Novo imóvel cadastrado pelo site da ${SITE.name}\n\n${body}\n`;
}
