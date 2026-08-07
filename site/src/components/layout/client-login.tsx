'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { DEMO_CREDENTIALS } from '@/data/demo-client-area';
import { setDemoSession } from '@/lib/demo-session';
import { useModalFocus } from '@/hooks/use-modal-focus';

interface ClientLoginProps {
  onClose: () => void;
}

export function ClientLogin({ onClose }: ClientLoginProps) {
  const router = useRouter();
  const dialogRef = useModalFocus<HTMLDivElement>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '')
      .trim()
      .toLowerCase();
    const password = String(form.get('password') ?? '');

    if (
      email !== DEMO_CREDENTIALS.email.toLowerCase() ||
      password !== DEMO_CREDENTIALS.password
    ) {
      setError('E-mail ou senha incorretos.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setDemoSession(true);
    router.push('/area-do-cliente');
    onClose();
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-card bg-surface shadow-panel">
        {/*
         * A brand header instead of a lone padlock: the mark says whose system
         * this is, which is the one thing a sign-in box owes the person
         * looking at it.
         */}
        <div className="relative flex items-center justify-between bg-brand-700 px-7 py-6">
          <Image
            src="/imagens/logo-branco.png"
            alt="Imobiliária Conceitto"
            width={175}
            height={30}
            className="h-6 w-auto object-contain object-left"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 inline-flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X className="size-4.5" aria-hidden />
          </button>
        </div>

        <div className="p-7">
          <h2 id="login-titulo" className="text-display text-2xl">
            Área do cliente
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Acompanhe contratos, repasses e documentos dos seus imóveis.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint"
              >
                E-mail
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                defaultValue={DEMO_CREDENTIALS.email}
                required
                className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm transition-colors focus:border-brand-500"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint"
              >
                Senha
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                defaultValue={DEMO_CREDENTIALS.password}
                required
                className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm transition-colors focus:border-brand-500"
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-brand-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/*
           * Stated rather than hidden. The pair is already filled in above, and
           * anyone presenting this needs to know the login is a prop — not a
           * credential that grants access to anything.
           */}
          <p className="mt-6 rounded-lg bg-surface-muted px-3.5 py-3 text-xs leading-relaxed text-ink-faint">
            <strong className="font-medium text-ink-soft">Demonstração.</strong> Acesso
            fictício, já preenchido, para apresentar a área do cliente. Não há cadastro
            nem dados reais por trás.
          </p>
        </div>
      </div>
    </div>
  );
}
