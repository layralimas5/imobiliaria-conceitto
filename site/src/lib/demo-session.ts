/**
 * The demo client-area session.
 *
 * `sessionStorage`, not a cookie: it has to survive the click from the sign-in
 * dialog through to `/area-do-cliente` and nothing more. It dies with the tab,
 * never leaves the browser, and no server ever sees it — the honest shape for a
 * sign-in that compares against a hard-coded pair. See `demo-client-area.ts`.
 *
 * Exposed as an external store rather than component state because two
 * unrelated components read it. `storage` events only fire in *other* tabs, so
 * writers notify local subscribers by hand.
 */

const KEY = 'conceitto-demo-cliente';

const listeners = new Set<() => void>();

export function subscribeDemoSession(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Returns a primitive, so `useSyncExternalStore` compares it by value. */
export function demoSessionSnapshot(): boolean {
  return window.sessionStorage.getItem(KEY) === '1';
}

/**
 * `null` means "not known yet": the server cannot read sessionStorage, and
 * answering `false` there would flash the signed-out screen on every reload.
 */
export function demoSessionServerSnapshot(): null {
  return null;
}

export function setDemoSession(signedIn: boolean): void {
  if (signedIn) window.sessionStorage.setItem(KEY, '1');
  else window.sessionStorage.removeItem(KEY);
  for (const listener of listeners) listener();
}
