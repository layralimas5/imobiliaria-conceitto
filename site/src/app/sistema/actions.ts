'use server';

import fs from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { PROPERTY_TYPES } from '@/domain/property';
import { invalidateListingPhotoIndex } from '@/lib/local-media';
import { readStore, todayLabel, writeStore } from '@/lib/system-store';

export interface ActionResult {
  readonly ok: boolean;
  readonly message: string;
  /** Field name → message, so the form can mark what is wrong. */
  readonly errors?: Record<string, string>;
}

/**
 * Finds the FormData whichever argument it arrives in.
 *
 * `useActionState` calls the action as `(previousState, formData)`. A form that
 * posts before React has hydrated arrives as `(formData)` — the previous state
 * simply is not there to send. Reading it positionally would break exactly the
 * submit that has no JavaScript to fall back on.
 */
function formDataFrom(a: unknown, b: unknown): FormData {
  if (b instanceof FormData) return b;
  if (a instanceof FormData) return a;
  throw new Error('Formulário enviado sem dados.');
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.');
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 160) => text(max).min(2, label);

/** "" and "abc" both mean "not informed" for a number the user may skip. */
const optionalNumber = z.preprocess((value) => {
  const raw = String(value ?? '').replace(/\./g, '').replace(',', '.').trim();
  if (raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}, z.number().nonnegative().nullable());

// ---------------------------------------------------------------- listings

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

const listingSchema = z.object({
  title: required('Informe um título'),
  description: text(4000),
  operation: z.enum(['venda', 'locacao']),
  type: z.enum(PROPERTY_TYPES),
  city: required('Informe a cidade', 80),
  neighborhood: required('Informe o bairro', 80),
  price: optionalNumber,
  area: optionalNumber,
  bedrooms: optionalNumber,
  suites: optionalNumber,
  bathrooms: optionalNumber,
  parkingSpaces: optionalNumber,
  features: text(600),
  isExclusive: z.boolean(),
});

export async function createListing(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = listingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
    operation: formData.get('operation'),
    type: formData.get('type'),
    city: formData.get('city'),
    neighborhood: formData.get('neighborhood'),
    price: formData.get('price'),
    area: formData.get('area'),
    bedrooms: formData.get('bedrooms'),
    suites: formData.get('suites'),
    bathrooms: formData.get('bathrooms'),
    parkingSpaces: formData.get('parkingSpaces'),
    features: formData.get('features') ?? '',
    isExclusive: formData.get('isExclusive') === 'on',
  });

  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  const store = readStore();
  const code = nextCode(store.listings.map((listing) => listing.code));

  try {
    const photos = formData
      .getAll('photos')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    for (const photo of photos) {
      if (!IMAGE_TYPES.has(photo.type)) {
        return { ok: false, message: `"${photo.name}" não é uma imagem aceita (JPG, PNG, WebP ou AVIF).` };
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return { ok: false, message: `"${photo.name}" passa de 8 MB.` };
      }
    }

    if (photos.length > 0) {
      const directory = path.join(process.cwd(), 'public', 'imagens', 'imoveis', code);
      fs.mkdirSync(directory, { recursive: true });
      let index = 1;
      for (const photo of photos) {
        const extension = path.extname(photo.name).toLowerCase() || '.jpg';
        const name = `${String(index).padStart(2, '0')}${extension}`;
        fs.writeFileSync(
          path.join(directory, name),
          Buffer.from(await photo.arrayBuffer()),
        );
        index += 1;
      }
      invalidateListingPhotoIndex();
    }

    writeStore({
      ...store,
      listings: [
        {
          code,
          ...parsed.data,
          features: parsed.data.features
            .split(/[,;\n]/)
            .map((feature) => feature.trim())
            .filter(Boolean),
          createdAt: new Date().toISOString(),
        },
        ...store.listings,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  // The public pages are statically generated; without this the new listing
  // would only appear on the next build.
  for (const route of ['/', '/imoveis', '/comprar', '/alugar', '/sistema/imoveis']) {
    revalidatePath(route);
  }
  revalidatePath('/imovel/[...slug]', 'page');

  return { ok: true, message: `Imóvel cadastrado com o código ${code}. Já está no site.` };
}

/** Panel codes start at 90001, well clear of the MSYS range. */
function nextCode(existing: readonly string[]): string {
  const highest = existing
    .map((code) => Number.parseInt(code, 10))
    .filter((value) => Number.isFinite(value) && value >= 90001)
    .reduce((max, value) => Math.max(max, value), 90000);
  return String(highest + 1);
}

// ------------------------------------------------------------------- leads

const leadSchema = z.object({
  name: required('Informe o nome'),
  phone: required('Informe o telefone', 25),
  email: z.union([z.string().trim().email('E-mail inválido').max(160), z.literal('')]),
  interest: required('Descreva o interesse', 200),
  source: required('Informe a origem', 40),
  stage: required('Informe a etapa', 40),
  agent: required('Informe o corretor', 120),
  budget: optionalNumber,
  notes: text(2000),
});

export async function createLead(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  try {
    const store = readStore();
    writeStore({
      ...store,
      leads: [
        { id: crypto.randomUUID(), ...parsed.data, createdAt: todayLabel() },
        ...store.leads,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/leads');
  revalidatePath('/sistema/crm');
  return { ok: true, message: 'Lead cadastrado.' };
}

// --------------------------------------------------------------- corretores

const agentSchema = z
  .object({
    name: required('Informe o nome'),
    creci: required('Informe o CRECI', 20),
    branch: required('Informe a unidade', 60),
    email: z.string().trim().email('E-mail inválido').max(160),
    phone: required('Informe o telefone', 25),
    role: required('Informe o perfil', 40),
    password: z.string().min(8, 'Use ao menos 8 caracteres').max(72),
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: 'As senhas não conferem',
    path: ['passwordConfirm'],
  });

export async function createAgent(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = agentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  // The confirmation field has done its job in the schema; it is not stored.
  const agent = { ...parsed.data, passwordConfirm: undefined };
  delete (agent as { passwordConfirm?: string }).passwordConfirm;

  try {
    const store = readStore();
    if (store.agents.some((existing) => existing.email === agent.email)) {
      return { ok: false, message: 'Já existe um corretor com esse e-mail.', errors: { email: 'E-mail em uso' } };
    }
    writeStore({
      ...store,
      agents: [
        { id: crypto.randomUUID(), ...agent, createdAt: todayLabel() },
        ...store.agents,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/corretores');
  return { ok: true, message: `Corretor cadastrado. O acesso é o e-mail ${agent.email}.` };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
