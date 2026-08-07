'use server';

import fs from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { isBranchScope } from '@/domain/branch';
import { BRANCH_COOKIE } from '@/lib/branch-cookie';
import { isLeadStage } from '@/domain/lead-pipeline';
import { LISTING_STATUSES, isPublished, type ListingStatus } from '@/domain/listing-status';
import { PROPERTY_TYPES } from '@/domain/property';
import { invalidateListingPhotoIndex } from '@/lib/local-media';
import { UPLOAD_DIR, readStore, todayLabel, writeStore } from '@/lib/system-store';

/**
 * Switches the unit the whole panel is scoped to. Writes the cookie every server
 * component reads, then revalidates the layout so every list on screen refilters
 * at once — the switch is not a filter on one page, it is which office you are
 * working in.
 */
export async function selectBranch(scope: string): Promise<void> {
  if (!isBranchScope(scope)) return;
  const store = await cookies();
  store.set(BRANCH_COOKIE, scope, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/sistema', 'layout');
}

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
  status: z.enum(LISTING_STATUSES),
  city: required('Informe a cidade', 80),
  neighborhood: required('Informe o bairro', 80),
  street: text(160),
  price: optionalNumber,
  condoFee: optionalNumber,
  propertyTax: optionalNumber,
  area: optionalNumber,
  landArea: optionalNumber,
  bedrooms: optionalNumber,
  suites: optionalNumber,
  bathrooms: optionalNumber,
  parkingSpaces: optionalNumber,
  features: text(600),
  videoUrl: z.union([z.string().trim().url('Endereço inválido').max(300), z.literal('')]),
  owner: text(160),
  agent: text(120),
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
    status: formData.get('status'),
    city: formData.get('city'),
    neighborhood: formData.get('neighborhood'),
    street: formData.get('street') ?? '',
    price: formData.get('price'),
    condoFee: formData.get('condoFee'),
    propertyTax: formData.get('propertyTax'),
    area: formData.get('area'),
    landArea: formData.get('landArea'),
    bedrooms: formData.get('bedrooms'),
    suites: formData.get('suites'),
    bathrooms: formData.get('bathrooms'),
    parkingSpaces: formData.get('parkingSpaces'),
    features: formData.get('features') ?? '',
    videoUrl: formData.get('videoUrl') ?? '',
    owner: formData.get('owner') ?? '',
    agent: formData.get('agent') ?? '',
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

  return {
    ok: true,
    message: isPublished(parsed.data.status)
      ? `Imóvel cadastrado com o código ${code}. Já está no site.`
      : `Imóvel cadastrado com o código ${code}. Como está "${parsed.data.status.replace('-', ' ')}", não aparece no site.`,
  };
}

// ------------------------------------------------------- status do imóvel

/**
 * The one-field update that moves a listing between commercial states — and,
 * because the public catalog reads the same field, takes it off the site or puts
 * it back. It is a separate action from `createListing` because it is the thing
 * a corretor does from the list, in one click, twenty times a week.
 */
export async function updateListingStatus(
  code: string,
  status: ListingStatus,
): Promise<ActionResult> {
  if (!LISTING_STATUSES.includes(status)) {
    return { ok: false, message: 'Status inválido.' };
  }

  try {
    const store = readStore();
    // Works for a listing cadastrado no painel and for one that came down the
    // MSYS feed: the override carries the status for whatever the panel does not
    // own, and `listing-status-source` reads both.
    writeStore({
      ...store,
      listings: store.listings.map((entry) =>
        entry.code === code ? { ...entry, status } : entry,
      ),
      listingStatuses: { ...store.listingStatuses, [code]: status },
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  for (const route of ['/', '/imoveis', '/comprar', '/alugar', '/sistema/imoveis', '/sistema/painel']) {
    revalidatePath(route);
  }
  revalidatePath('/imovel/[...slug]', 'page');

  return {
    ok: true,
    message: isPublished(status) ? 'Status atualizado. Segue no site.' : 'Status atualizado. Saiu do site.',
  };
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
        {
          id: crypto.randomUUID(),
          ...parsed.data,
          propertyCode: null,
          createdAt: todayLabel(),
        },
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

/**
 * Moves a lead between funnel stages. Called from the board and from the lead's
 * own page; the demo seeds are read-only, so only stored leads actually move.
 */
export async function updateLeadStage(id: string, stage: string): Promise<ActionResult> {
  if (!isLeadStage(stage)) return { ok: false, message: 'Etapa inválida.' };

  try {
    const store = readStore();
    if (!store.leads.some((lead) => lead.id === id)) {
      return {
        ok: false,
        message: 'Lead de demonstração: a etapa muda na tela, mas não é gravada.',
      };
    }
    writeStore({
      ...store,
      leads: store.leads.map((lead) => (lead.id === id ? { ...lead, stage } : lead)),
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/leads');
  revalidatePath('/sistema/crm');
  revalidatePath('/sistema/painel');
  return { ok: true, message: 'Etapa atualizada.' };
}

/** Hands a lead to a corretor — the manual half of lead distribution. */
export async function assignLead(id: string, agent: string): Promise<ActionResult> {
  try {
    const store = readStore();
    if (!store.leads.some((lead) => lead.id === id)) {
      return { ok: false, message: 'Lead de demonstração: a atribuição não é gravada.' };
    }
    writeStore({
      ...store,
      leads: store.leads.map((lead) => (lead.id === id ? { ...lead, agent } : lead)),
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/leads');
  revalidatePath('/sistema/crm');
  return { ok: true, message: `Lead atribuído a ${agent}.` };
}

// --------------------------------------------------------------- corretores

/**
 * A corretor is a person in the team, not a login: the access to the panel is
 * created in Usuários, by whoever administers the system. Keeping the two apart
 * means hiring someone does not silently hand them a password.
 */
const agentSchema = z.object({
  name: required('Informe o nome'),
  creci: required('Informe o CRECI', 20),
  branch: required('Informe a unidade', 60),
  email: z.string().trim().email('E-mail inválido').max(160),
  phone: required('Informe o telefone', 25),
  role: required('Informe o perfil', 40),
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

  try {
    const store = readStore();
    if (store.agents.some((existing) => existing.email === parsed.data.email)) {
      return { ok: false, message: 'Já existe um corretor com esse e-mail.', errors: { email: 'E-mail em uso' } };
    }
    writeStore({
      ...store,
      agents: [
        { id: crypto.randomUUID(), ...parsed.data, createdAt: todayLabel() },
        ...store.agents,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/corretores');
  return {
    ok: true,
    message: 'Corretor cadastrado. Para dar acesso ao sistema, crie o usuário em Usuários.',
  };
}

// ----------------------------------------------------------------- usuários

const userSchema = z
  .object({
    name: required('Informe o nome'),
    email: z.string().trim().email('E-mail inválido').max(160),
    role: required('Informe o perfil', 40),
    branch: required('Informe a unidade', 60),
    password: z.string().min(8, 'Use ao menos 8 caracteres').max(72),
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: 'As senhas não conferem',
    path: ['passwordConfirm'],
  });

export async function createUser(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  // The confirmation field has done its job in the schema; it is not stored.
  const user = { ...parsed.data, passwordConfirm: undefined };
  delete (user as { passwordConfirm?: string }).passwordConfirm;

  try {
    const store = readStore();
    if (store.users.some((existing) => existing.email === user.email)) {
      return { ok: false, message: 'Já existe um usuário com esse e-mail.', errors: { email: 'E-mail em uso' } };
    }
    writeStore({
      ...store,
      users: [
        { id: crypto.randomUUID(), ...user, createdAt: todayLabel() },
        ...store.users,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/usuarios');
  return { ok: true, message: `Usuário criado. O acesso é o e-mail ${user.email}.` };
}

// ---------------------------------------------------------------- clientes

const contractFields = {
  contractKind: z.enum(['venda', 'locacao']),
  contractListing: text(200),
  contractOwner: text(160),
  contractValue: optionalNumber,
  contractRate: optionalNumber,
  contractSignedAt: text(20),
  contractUntil: text(20),
};

const clientSchema = z.object({
  name: required('Informe o nome'),
  phone: required('Informe o telefone', 25),
  email: z.union([z.string().trim().email('E-mail inválido').max(160), z.literal('')]),
  document: text(30),
  kind: required('Informe o perfil', 40),
  looking: text(200),
  budget: optionalNumber,
  agent: required('Informe o corretor', 120),
  branch: required('Informe a unidade', 60),
  notes: text(2000),
  /** Checked when the cadastro is happening because a deal just closed. */
  withContract: z.boolean(),
  ...contractFields,
});

/**
 * Registering a client, and — when the reason for registering is that a deal
 * closed — the contract in the same submit.
 *
 * Two records from one form because that is one act: nobody cadastra um
 * comprador and then, as a separate decision, remembers to open a contract. The
 * checkbox is what turns the second half on, so the everyday case stays short.
 */
export async function createClient(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = clientSchema.safeParse({
    ...Object.fromEntries(formData),
    withContract: formData.get('withContract') === 'on',
  });

  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  if (data.withContract && data.contractListing.trim().length < 2) {
    return {
      ok: false,
      message: 'Para gerar o contrato, informe o imóvel.',
      errors: { contractListing: 'Informe o imóvel do negócio' },
    };
  }

  let code: string | null = null;

  try {
    const store = readStore();
    const client = {
      id: crypto.randomUUID(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      document: data.document,
      kind: data.kind,
      looking: data.looking,
      budget: data.budget,
      agent: data.agent,
      branch: data.branch,
      notes: data.notes,
      createdAt: todayLabel(),
    };

    const contracts = [...store.contracts];
    if (data.withContract) {
      code = nextContractCode(contracts.map((entry) => entry.code));
      contracts.unshift({
        id: crypto.randomUUID(),
        code,
        kind: data.contractKind,
        listing: data.contractListing,
        client: data.name,
        owner: data.contractOwner,
        value: data.contractValue,
        commissionRate: data.contractRate,
        signedAt: data.contractSignedAt || todayLabel(),
        until: data.contractUntil || '—',
        status: 'em assinatura',
        branch: data.branch,
        notes: '',
        createdAt: todayLabel(),
      });
    }

    writeStore({ ...store, clients: [client, ...store.clients], contracts });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/clientes');
  revalidatePath('/sistema/contratos');
  revalidatePath('/sistema/painel');

  return {
    ok: true,
    message: code
      ? `Cliente cadastrado e contrato ${code} aberto em Contratos, aguardando assinatura.`
      : 'Cliente cadastrado.',
  };
}

// --------------------------------------------------------------- contratos

const contractSchema = z.object({
  kind: z.enum(['venda', 'locacao']),
  listing: required('Informe o imóvel', 200),
  client: required('Informe o cliente', 160),
  owner: text(160),
  value: optionalNumber,
  commissionRate: optionalNumber,
  signedAt: text(20),
  until: text(20),
  status: required('Informe a situação', 40),
  branch: required('Informe a unidade', 60),
  notes: text(2000),
});

export async function createContract(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = contractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  let code: string;
  try {
    const store = readStore();
    code = nextContractCode(store.contracts.map((entry) => entry.code));
    writeStore({
      ...store,
      contracts: [
        {
          id: crypto.randomUUID(),
          code,
          ...parsed.data,
          signedAt: parsed.data.signedAt || todayLabel(),
          until: parsed.data.until || '—',
          createdAt: todayLabel(),
        },
        ...store.contracts,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/contratos');
  revalidatePath('/sistema/painel');
  return { ok: true, message: `Contrato ${code} registrado.` };
}

/** Panel contracts start at 500 so they never collide with the seeded examples. */
function nextContractCode(existing: readonly string[]): string {
  const year = new Date().getFullYear();
  const highest = existing
    .map((code) => Number.parseInt(code.split('-')[2] ?? '', 10))
    .filter((value) => Number.isFinite(value) && value >= 500)
    .reduce((max, value) => Math.max(max, value), 499);
  return `C-${year}-${highest + 1}`;
}

// -------------------------------------------------------------- documentos

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

const documentSchema = z.object({
  kind: required('Informe o tipo', 40),
  linkedKind: required('Informe a que se vincula', 40),
  linkedTo: required('Informe o vínculo', 200),
  uploadedBy: required('Informe quem enviou', 120),
});

/**
 * Attaching a file to an imóvel, contrato, cliente or proprietário.
 *
 * The file is written outside `public/`, so it is never reachable by URL. That
 * is the whole point of the screen: a matrícula in a shared drive belongs to
 * nobody, and one in a public folder belongs to everybody.
 */
export async function createDocument(
  previous: ActionResult | null | FormData,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = formDataFrom(previous, maybeFormData);
  const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Confira os campos destacados.', errors: fieldErrors(parsed.error) };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Escolha um arquivo.', errors: { file: 'Nenhum arquivo escolhido' } };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, message: `"${file.name}" passa de 20 MB.` };
  }

  const id = crypto.randomUUID();
  let storedAs: string | null = null;

  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    storedAs = `${id}${path.extname(file.name).toLowerCase()}`;
    fs.writeFileSync(
      path.join(UPLOAD_DIR, storedAs),
      Buffer.from(await file.arrayBuffer()),
    );

    const store = readStore();
    writeStore({
      ...store,
      documents: [
        {
          id,
          name: file.name,
          storedAs,
          ...parsed.data,
          size: formatBytes(file.size),
          uploadedAt: todayLabel(),
        },
        ...store.documents,
      ],
    });
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar: ${messageOf(error)}` };
  }

  revalidatePath('/sistema/documentos');
  revalidatePath('/sistema/contratos');
  return { ok: true, message: `"${file.name}" anexado.` };
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024))} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
