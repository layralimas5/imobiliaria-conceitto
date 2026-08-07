import fs from 'node:fs';
import path from 'node:path';

/**
 * Where the panel keeps what it creates.
 *
 * A single JSON file next to the project, not a database: the Conceitto's real
 * records live in MSYS Imob, and standing up a database for a demo would be
 * pretending at an integration that does not exist. What this does buy is the
 * thing that matters for the demo — an imóvel cadastrado no painel really does
 * show up on the site, because both read the same file.
 *
 * It writes to disk, so it works on a normal Node server and in development.
 * On a serverless host the filesystem is read-only and creation will fail; the
 * fix there is a database, which is the point at which this file goes away.
 */

const FILE = path.join(process.cwd(), 'dados-sistema.json');

export interface StoredLead {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly interest: string;
  readonly source: string;
  readonly stage: string;
  readonly agent: string;
  readonly budget: number | null;
  readonly notes: string;
  /** The listing the visitor was looking at when they asked to be contacted. */
  readonly propertyCode: string | null;
  readonly createdAt: string;
}

export interface StoredAgent {
  readonly id: string;
  readonly name: string;
  readonly creci: string;
  readonly branch: string;
  readonly email: string;
  readonly phone: string;
  readonly role: string;
  readonly createdAt: string;
}

/**
 * A login. Separate from the corretor record because the two answer different
 * questions — who carries this listing, versus who may open this screen — and
 * the office has people who are one without being the other.
 */
export interface StoredUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  /** Demo only. A real panel stores a hash and never reads it back. */
  readonly password: string;
  readonly role: string;
  readonly branch: string;
  readonly createdAt: string;
}

export interface StoredListing {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly operation: 'venda' | 'locacao';
  readonly type: string;
  readonly city: string;
  readonly neighborhood: string;
  readonly street: string;
  readonly price: number | null;
  readonly condoFee: number | null;
  readonly propertyTax: number | null;
  readonly area: number | null;
  readonly landArea: number | null;
  readonly bedrooms: number | null;
  readonly suites: number | null;
  readonly bathrooms: number | null;
  readonly parkingSpaces: number | null;
  readonly features: readonly string[];
  readonly videoUrl: string;
  readonly owner: string;
  readonly agent: string;
  /** See `@/domain/listing-status`: decides whether the site still shows it. */
  readonly status: string;
  readonly isExclusive: boolean;
  readonly createdAt: string;
}

export interface StoredClient {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly document: string;
  readonly kind: string;
  readonly looking: string;
  readonly budget: number | null;
  readonly agent: string;
  readonly branch: string;
  readonly notes: string;
  readonly createdAt: string;
}

export interface StoredContract {
  readonly id: string;
  readonly code: string;
  readonly kind: 'venda' | 'locacao';
  readonly listing: string;
  readonly client: string;
  readonly owner: string;
  readonly value: number | null;
  readonly commissionRate: number | null;
  readonly signedAt: string;
  readonly until: string;
  readonly status: string;
  readonly branch: string;
  readonly notes: string;
  readonly createdAt: string;
}

/**
 * A file attached to something. The binary lives outside `public/` on purpose:
 * a matrícula or an RG must never be one guessed URL away from the internet.
 */
export interface StoredDocument {
  readonly id: string;
  readonly name: string;
  readonly storedAs: string | null;
  readonly kind: string;
  readonly linkedKind: string;
  readonly linkedTo: string;
  readonly size: string;
  readonly uploadedBy: string;
  readonly uploadedAt: string;
}

export interface SystemStore {
  readonly leads: readonly StoredLead[];
  readonly agents: readonly StoredAgent[];
  readonly listings: readonly StoredListing[];
  readonly users: readonly StoredUser[];
  /**
   * Commercial status by listing code, for listings the panel does not own.
   *
   * MSYS is the source of truth for what an imóvel *is*; the office is the
   * source of truth for whether it is still for sale. Keeping the override here
   * lets a corretor mark a synced listing as vendido — and have it leave the
   * site — without the panel pretending it can edit the MSYS record.
   */
  readonly listingStatuses: Record<string, string>;
  readonly clients: readonly StoredClient[];
  readonly contracts: readonly StoredContract[];
  readonly documents: readonly StoredDocument[];
}

const EMPTY: SystemStore = {
  leads: [],
  agents: [],
  listings: [],
  users: [],
  listingStatuses: {},
  clients: [],
  contracts: [],
  documents: [],
};

/** Uploads land here, next to the store and outside anything Next serves. */
export const UPLOAD_DIR = path.join(process.cwd(), 'arquivos-sistema');

/** Read fresh every time: the file is small and staleness would be a bug. */
export function readStore(): SystemStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Partial<SystemStore>;
    return {
      leads: parsed.leads ?? [],
      agents: parsed.agents ?? [],
      listings: parsed.listings ?? [],
      users: parsed.users ?? [],
      listingStatuses: parsed.listingStatuses ?? {},
      clients: parsed.clients ?? [],
      contracts: parsed.contracts ?? [],
      documents: parsed.documents ?? [],
    };
  } catch {
    // Absent or unreadable is the normal state before anything is created.
    return EMPTY;
  }
}

export function writeStore(next: SystemStore): void {
  fs.writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

/** Timestamp for created records, formatted the way the panel displays dates. */
export function todayLabel(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
}
