import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Turns an already-mounted element into a full-viewport focus layer: scroll lock, Escape, focus trap, focus return. */
export function useFocusPanel(ref: RefObject<HTMLElement | null> | null, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const el = ref?.current ?? null;
  useEffect(() => {
    if (!ref) return;
    const node = ref.current;
    if (!node) return;
    const prev = document.activeElement as HTMLElement | null;
    const body = document.body.style.overflow;
    const html = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (!node.contains(document.activeElement)) node.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
      if (!items.length) { e.preventDefault(); node.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      const a = document.activeElement;
      if (e.shiftKey && (a === first || a === node || !node.contains(a))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (a === last || !node.contains(a))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = body;
      document.documentElement.style.overflow = html;
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [ref, el]);
}
