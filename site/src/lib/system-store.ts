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
  readonly createdAt: string;
}

export interface StoredAgent {
  readonly id: string;
  readonly name: string;
  readonly creci: string;
  readonly branch: string;
  readonly email: string;
  readonly phone: string;
  /** Demo only. A real panel stores a hash and never reads it back. */
  readonly password: string;
  readonly role: string;
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
  readonly price: number | null;
  readonly area: number | null;
  readonly bedrooms: number | null;
  readonly suites: number | null;
  readonly bathrooms: number | null;
  readonly parkingSpaces: number | null;
  readonly features: readonly string[];
  readonly isExclusive: boolean;
  readonly createdAt: string;
}

export interface SystemStore {
  readonly leads: readonly StoredLead[];
  readonly agents: readonly StoredAgent[];
  readonly listings: readonly StoredListing[];
}

const EMPTY: SystemStore = { leads: [], agents: [], listings: [] };

/** Read fresh every time: the file is small and staleness would be a bug. */
export function readStore(): SystemStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Partial<SystemStore>;
    return {
      leads: parsed.leads ?? [],
      agents: parsed.agents ?? [],
      listings: parsed.listings ?? [],
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
