import { NextResponse } from 'next/server';
import { readUpload } from '@/lib/system-store';

/**
 * Serves listing photography uploaded through the panel.
 *
 * The bytes live in the panel's own store, never in `public/`, because on a
 * serverless host the deployed bundle is read-only — a photo written at runtime
 * has nowhere on disk to go, and anything that did land there would be wiped by
 * the next deploy.
 *
 * Only the `imoveis/` prefix is reachable. The same store also holds contracts,
 * matrículas and documentos pessoais, and none of those are one guessed URL
 * away from the internet.
 */
const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caminho: string[] }> },
): Promise<NextResponse> {
  const { caminho } = await params;
  const key = caminho.map(decodeURIComponent).join('/');

  if (!key.startsWith('imoveis/') || key.includes('..')) {
    return new NextResponse('Não encontrado', { status: 404 });
  }

  const extension = key.slice(key.lastIndexOf('.')).toLowerCase();
  const type = TYPES[extension];
  if (!type) return new NextResponse('Não encontrado', { status: 404 });

  const bytes = await readUpload(key);
  if (!bytes) return new NextResponse('Não encontrado', { status: 404 });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'content-type': type,
      // The key carries the listing code and an index, and a listing never
      // rewrites a photo in place — a new set gets new keys.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
