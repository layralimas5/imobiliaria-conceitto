import { NextResponse } from 'next/server';
import { propertyRepository } from '@/data/catalog-repository';
import { developmentRepository } from '@/data/development-catalog';
import { leadSchema } from '@/domain/lead';
import { deliverLead, type LeadContext } from '@/lib/lead-delivery';

/**
 * Lead intake.
 *
 * Delivery goes through `deliverLead`, which fans the lead out to whichever
 * channels the environment configures (Resend e-mail, webhook). With no channel
 * configured the payload is validated and logged — deliberate, so the site runs
 * before the client hands over credentials — but once a channel exists and every
 * one of them fails, the response is a 502 and the form tells the visitor to use
 * WhatsApp. A lead is never accepted with a green check it did not earn.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Confira os campos destacados.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  // Honeypot hit: accept silently so bots do not learn they were filtered.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const lead = { ...parsed.data, website: undefined };
  const context = await resolveContext(lead.propertyCode, lead.developmentSlug);

  let outcome;
  try {
    outcome = await deliverLead(lead, context);
  } catch (error) {
    console.error('[lead] delivery threw', error);
    return NextResponse.json(
      { error: 'Não conseguimos registrar seu contato agora.' },
      { status: 502 },
    );
  }

  if (outcome.unconfigured) {
    console.warn(
      '[lead] no delivery channel configured — set RESEND_API_KEY + LEAD_INBOX or LEAD_WEBHOOK_URL',
      {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        intent: lead.intent,
        message: lead.message,
        propertyCode: lead.propertyCode,
        developmentSlug: lead.developmentSlug,
        receivedAt: new Date().toISOString(),
      },
    );
    return NextResponse.json({ ok: true });
  }

  for (const result of outcome.results) {
    if (!result.ok) console.error(`[lead] ${result.channel} failed: ${result.detail}`);
  }

  if (!outcome.ok) {
    return NextResponse.json(
      { error: 'Não conseguimos registrar seu contato agora.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

/**
 * Resolves what the visitor was looking at. A code that no longer exists is not
 * an error — the listing may have left the catalog between the visit and the
 * submit, and losing the lead over that would be worse than losing the context.
 */
async function resolveContext(
  propertyCode: string | undefined,
  developmentSlug: string | undefined,
): Promise<LeadContext> {
  const [property, development] = await Promise.all([
    propertyCode ? propertyRepository.findByCode(propertyCode) : Promise.resolve(null),
    developmentSlug
      ? developmentRepository.findBySlug(developmentSlug)
      : Promise.resolve(null),
  ]);
  return { property, development };
}
