import { NextResponse } from 'next/server';
import { leadSchema } from '@/domain/lead';

/**
 * Lead intake.
 *
 * TODO(integration): forward to the Conceitto inbox and to MSYS Imob. The
 * client has not provided SMTP credentials or a CRM webhook yet, so the payload
 * is validated and logged server-side. Nothing here is thrown away silently —
 * a failed delivery must surface as a 5xx once the transport is wired.
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
  console.info('[lead]', {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    intent: lead.intent,
    message: lead.message,
    propertyCode: lead.propertyCode,
    developmentSlug: lead.developmentSlug,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
