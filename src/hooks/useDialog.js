import { useEffect } from 'react';

export default function useDialog(ref, onClose) {
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement;
    const focusables = () => [...el.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length);
    (focusables()[0] || el).focus();
    const handleKey = event => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      if (event.key !== 'Tab') return;
      const nodes = focusables();
      const first = nodes[0] || el;
      const last = nodes.at(-1) || el;
      if (event.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !el.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    el.addEventListener('keydown', handleKey);
    return () => { el.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [ref, onClose]);
}
