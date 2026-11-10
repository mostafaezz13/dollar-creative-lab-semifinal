import { useEffect, useState } from 'react';
import gsap from 'gsap';
import useReducedMotion from './useReducedMotion.js';

// Observe actual visibility, including the transformed virtual-scroll track.
export default function useReveal(ref, selector, dependency) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const elements = [...root.querySelectorAll(selector)];
    const context = gsap.context(() => {
      if (!reduced) gsap.set(elements, { opacity: 0, y: 52, rotationX: -7, transformPerspective: 1200 });
      else gsap.set(elements, { opacity: 1, y: 0, rotationX: 0, scale: 1 });
    }, root);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === root) { setVisible(entry.isIntersecting); return; }
        if (!entry.isIntersecting) return;
        if (!reduced) gsap.to(entry.target, { opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 1.05, ease: 'power4.out', overwrite: 'auto', delay: (elements.indexOf(entry.target) % 4) * 0.065 });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    observer.observe(root);
    elements.forEach(el => observer.observe(el));
    return () => { observer.disconnect(); gsap.killTweensOf(elements); context.revert(); };
  }, [ref, selector, dependency, reduced]);
  return visible;
}
