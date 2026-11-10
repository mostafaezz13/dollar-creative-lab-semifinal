import React, { useLayoutEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function SplitText({ children, className = '', style = {}, tag: Tag = 'div', type = 'words', inView = true, delay = 0, duration = 1.1, stagger = .055, yOffset = 110, rotateX = 40 }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  useLayoutEffect(() => {
    const units = [...(ref.current?.querySelectorAll('.split-unit-inner') || [])];
    const offscreen = `translateY(${yOffset}%) rotateX(${-rotateX}deg)`;
    if (reduced) {
      units.forEach(unit=>{unit.style.opacity='1';unit.style.transform='none';});
      return;
    }
    const animations=units.map((unit,index)=>{
      const current=getComputedStyle(unit);
      const to=inView?{transform:'translateY(0%) rotateX(0deg)',opacity:1}:{transform:`translateY(-35%) rotateX(${rotateX*.4}deg)`,opacity:0};
      // A never-entered title remains below its mask until its first entrance.
      if(!inView&&current.opacity==='0'){unit.style.transform=offscreen;return null;}
      return unit.animate([{transform:current.transform,opacity:current.opacity},to],{
        duration:inView?duration*1000:280,delay:inView?(delay+index*stagger)*1000:Math.min(index,5)*12,
        easing:inView?'cubic-bezier(.16,1,.3,1)':'cubic-bezier(.4,0,.6,1)',fill:'both'
      });
    }).filter(Boolean);
    return () => {units.forEach(unit=>{const current=getComputedStyle(unit);unit.style.transform=current.transform;unit.style.opacity=current.opacity;});animations.forEach(animation => animation.cancel());};
  }, [children, inView, delay, duration, stagger, yOffset, rotateX, reduced]);
  const unit = (text, key) => <span key={key} className="split-mask"><span className="split-unit-inner" style={{ transform: reduced ? 'none' : `translateY(${yOffset}%) rotateX(${-rotateX}deg)`, opacity: reduced ? 1 : 0 }}>{text}</span></span>;
  return <Tag ref={ref} className={`split-text ${className}`} style={style} aria-label={typeof children === 'string' ? children : undefined}>
    {typeof children !== 'string' ? children : children.split(/(\s+)/).map((word, i) => /^\s+$/.test(word)
      ? <React.Fragment key={i}>{word}</React.Fragment>
      : <span className="split-word" aria-hidden="true" key={i}>{type === 'chars' ? [...word].map((char,j) => unit(char,j)) : unit(word,0)}</span>)}
  </Tag>;
}
