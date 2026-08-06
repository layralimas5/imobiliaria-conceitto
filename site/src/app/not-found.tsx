import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-eyebrow">Erro 404</p>
      <h1 className="text-display mt-4 text-5xl md:text-6xl">Página não encontrada</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
        O imóvel pode ter sido vendido, alugado ou retirado do site. Dá uma olhada no que
        temos disponível agora.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/comprar"
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Imóveis à venda
        </Link>
        <Link
          href="/alugar"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-line-strong"
        >
          Imóveis para alugar
        </Link>
      </div>
    </div>
  );
}
