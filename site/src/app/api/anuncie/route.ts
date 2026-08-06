import { NextResponse } from 'next/server';
import {
  MAX_PHOTOS,
  MAX_TOTAL_PHOTO_BYTES,
  isAcceptedPhoto,
  listingSubmissionSchema,
} from '@/domain/listing-submission';
import { deliverSubmission, type SubmissionPhoto } from '@/lib/submission-delivery';

/**
 * Owner submissions from `/anuncie`.
 *
 * Takes multipart form data because of the photos. Same delivery contract as
 * `/api/leads`: with no channel configured the payload is validated and logged
 * and the answer is 200, so the page works before credentials arrive; with a
 * channel configured and every one failing the answer is 502, because telling
 * an owner their property was received when it was not is worse than an error.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const candidate = Object.fromEntries(
    [
      'ownerName',
      'ownerEmail',
      'ownerPhone',
      'operation',
      'type',
      'city',
      'neighborhood',
      'street',
      'area',
      'bedrooms',
      'bathrooms',
      'parkingSpaces',
      'priceExpectation',
      'description',
      'website',
    ].map((field) => [field, stringOf(form.get(field))]),
  );

  const parsed = listingSubmissionSchema.safeParse(candidate);
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

  if (parsed.data.website) return NextResponse.json({ ok: true });

  const photos: SubmissionPhoto[] = [];
  let totalBytes = 0;
  for (const entry of form.getAll('photos')) {
    if (!(entry instanceof File)) continue;
    if (photos.length >= MAX_PHOTOS) break;
    if (!isAcceptedPhoto(entry)) {
      return NextResponse.json(
        { error: 'Envie imagens JPG, PNG ou WebP de até 5 MB cada.' },
        { status: 422 },
      );
    }
    totalBytes += entry.size;
    if (totalBytes > MAX_TOTAL_PHOTO_BYTES) {
      return NextResponse.json(
        { error: 'As fotos somam mais que o limite. Envie menos ou reduza o tamanho.' },
        { status: 413 },
      );
    }
    photos.push({
      filename: safeFilename(entry.name, photos.length),
      contentType: entry.type,
      bytes: Buffer.from(await entry.arrayBuffer()),
    });
  }

  const submission = { ...parsed.data, website: undefined };

  let outcome;
  try {
    outcome = await deliverSubmission(submission, photos);
  } catch (error) {
    console.error('[captacao] delivery threw', error);
    return NextResponse.json(
      { error: 'Não conseguimos registrar seu imóvel agora.' },
      { status: 502 },
    );
  }

  if (outcome.unconfigured) {
    console.warn(
      '[captacao] no delivery channel configured — set RESEND_API_KEY + LEAD_INBOX or LEAD_WEBHOOK_URL',
      {
        ownerName: submission.ownerName,
        ownerEmail: submission.ownerEmail,
        ownerPhone: submission.ownerPhone,
        operation: submission.operation,
        type: submission.type,
        city: submission.city,
        neighborhood: submission.neighborhood,
        photos: photos.length,
        receivedAt: new Date().toISOString(),
      },
    );
    return NextResponse.json({ ok: true });
  }

  for (const result of outcome.results) {
    if (!result.ok) console.error(`[captacao] ${result.channel} failed: ${result.detail}`);
  }

  if (!outcome.ok) {
    return NextResponse.json(
      { error: 'Não conseguimos registrar seu imóvel agora.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function stringOf(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

/** Filenames arrive from the visitor's disk; never trust them as paths. */
function safeFilename(name: string, index: number): string {
  const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
  const safeExtension = /^\.(jpe?g|png|webp)$/.test(extension) ? extension : '.jpg';
  return `foto-${String(index + 1).padStart(2, '0')}${safeExtension}`;
}
