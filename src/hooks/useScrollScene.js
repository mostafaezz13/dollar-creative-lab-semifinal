import { useLayoutEffect } from 'react';
import useReducedMotion from './useReducedMotion.js';

export default function useScrollScene(ref, scrollOffset) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    el.style.setProperty('--scene-progress', reduced ? .5 : progress);
    el.dataset.inView = String(rect.bottom > 0 && rect.top < window.innerHeight);
  }, [ref, scrollOffset, reduced]);
}
