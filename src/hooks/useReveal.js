import { useLayoutEffect, useState } from 'react';
import useReducedMotion from './useReducedMotion.js';

// Repeatable entrances/exits, using independent transforms so scene transforms
// and pointer-driven tilt keep working on the same element.
export default function useReveal(ref, selector, dependency) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const records = new Map();
    let sequence = 0;
    const finish = (element, values) => Object.assign(element.style, values);
    const reveal = (element, show, rect) => {
      const record = records.get(element);
      if (!record || record.show === show) return;
      record.show = show;
      const current = getComputedStyle(element);
      const from = { opacity: current.opacity, translate: current.translate, rotate: current.rotate, scale: current.scale };
      record.animation?.cancel();
      const to = show || reduced
        ? { opacity: '1', translate: '0 0', rotate: '0deg', scale: '1' }
        : { opacity: '0', translate: `0 ${rect?.bottom < innerHeight / 2 ? '-24px' : '36px'}`, rotate: 'x -4deg', scale: '.985' };
      if (reduced) { finish(element,to); element.dataset.motionState='visible'; return; }
      element.dataset.motionState = show ? 'entering' : 'exiting';
      const animation = element.animate([from,to], {
        duration: show ? 780 : 300,
        delay: show ? (record.index % 5) * 42 : 0,
        easing: show ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,.6,1)', fill:'both'
      });
      record.animation = animation;
      animation.onfinish = () => {
        if (record.animation !== animation) return;
        finish(element,to); animation.cancel(); record.animation=null;
        element.dataset.motionState=show?'visible':'hidden';
      };
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.target === root) setVisible(entry.isIntersecting);
      if (records.has(entry.target)) reveal(entry.target, entry.isIntersecting, entry.boundingClientRect);
    }), { threshold:0, rootMargin:'-7% 0px -7%' });
    observer.observe(root);
    const register = () => {
      for (const [element,record] of records) {
        if (root.contains(element)) continue;
        record.animation?.cancel(); observer.unobserve(element); records.delete(element);
      }
      root.querySelectorAll(selector).forEach(element => {
        if (records.has(element)) return;
        records.set(element,{ show:false, animation:null, index:sequence++, previous:{opacity:element.style.opacity,translate:element.style.translate,rotate:element.style.rotate,scale:element.style.scale} });
        if (!reduced) finish(element,{opacity:'0',translate:'0 36px',rotate:'x -4deg',scale:'.985'});
        else finish(element,{opacity:'1',translate:'0 0',rotate:'0deg',scale:'1'});
        element.dataset.motionState=reduced?'visible':'hidden';
        observer.observe(element);
      });
    };
    register();
    const changes = new MutationObserver(register);
    changes.observe(root,{childList:true,subtree:true});
    const focus = event => {
      for(const element of records.keys()) if(element.contains(event.target)) reveal(element,true);
    };
    root.addEventListener('focusin',focus);
    return () => {
      observer.disconnect(); changes.disconnect();root.removeEventListener('focusin',focus);
      records.forEach((record,element)=>{record.animation?.cancel();finish(element,record.previous);delete element.dataset.motionState;});
    };
  },[ref,selector,dependency,reduced]);
  return visible;
}
