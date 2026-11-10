import React, { useLayoutEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function SplitText({ children, className = '', style = {}, tag: Tag = 'div', type = 'words', inView = true, delay = 0, duration = 1.1, stagger = .055, yOffset = 110, rotateX = 40 }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  useLayoutEffect(() => {
    const units = [...(ref.current?.querySelectorAll('.split-unit-inner') || [])];
    const offscreen = `translateY(${yOffset}%) rotateX(${-rotateX}deg)`;
    if (reduced || !inView) {
      units.forEach(unit => { unit.style.opacity = reduced ? '1' : '0'; unit.style.transform = reduced ? 'none' : offscreen; });
      return;
    }
    const animations = units.map((unit,index) => unit.animate([
      { transform: offscreen, opacity: 0 },
      { transform: 'translateY(0%) rotateX(0deg)', opacity: 1 }
    ], { duration: duration * 1000, delay: (delay + index * stagger) * 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }));
    return () => animations.forEach(animation => animation.cancel());
  }, [children, inView, delay, duration, stagger, yOffset, rotateX, reduced]);
  const unit = (text, key) => <span key={key} className="split-mask"><span className="split-unit-inner" style={{ transform: reduced ? 'none' : `translateY(${yOffset}%) rotateX(${-rotateX}deg)`, opacity: reduced ? 1 : 0 }}>{text}</span></span>;
  return <Tag ref={ref} className={`split-text ${className}`} style={style} aria-label={typeof children === 'string' ? children : undefined}>
    {typeof children !== 'string' ? children : children.split(/(\s+)/).map((word, i) => /^\s+$/.test(word)
      ? <React.Fragment key={i}>{word}</React.Fragment>
      : <span className="split-word" aria-hidden="true" key={i}>{type === 'chars' ? [...word].map((char,j) => unit(char,j)) : unit(word,0)}</span>)}
  </Tag>;
}
