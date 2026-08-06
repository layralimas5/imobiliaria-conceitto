'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focus management for anything declaring `aria-modal`.
 *
 * A dialog that covers the page but leaves focus behind it is worse than no
 * dialog: Tab walks content the user cannot see, and Escape lands them nowhere.
 * This moves focus in on open, cycles it inside while open, and hands it back to
 * whatever opened the dialog on close.
 *
 * Returns the ref to put on the dialog container.
 */
export function useModalFocus<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const opener = document.activeElement as HTMLElement | null;

    const focusable = () =>
      [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );

    const first = focusable()[0];
    if (first) {
      first.focus();
    } else {
      container.tabIndex = -1;
      container.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === firstElement || !container?.contains(current))) {
        event.preventDefault();
        lastElement.focus();
        return;
      }
      if (!event.shiftKey && current === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // The opener can be gone if the dialog closed on a route change.
      if (opener?.isConnected) opener.focus();
    };
  }, [active]);

  return containerRef;
}
