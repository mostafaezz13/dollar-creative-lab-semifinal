import React, { useEffect, useRef, useState } from 'react';
import BrandLogo from './BrandLogo.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

// Only the opening artwork and fonts gate entry. Remote video never blocks it.
export default function Preloader({ posters, onComplete, mobileMode = false }) {
  const initialPosters = useRef(posters.filter(Boolean).slice(0, 3));
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    let disposed = false, frame, exitTimer, completed = 0, target = 0, shown = 0;
    const images = [];
    const started = performance.now();
    const tasks = initialPosters.current.length + 2;
    const advance = () => { if (!disposed) { completed++; target = completed / tasks * 100; } };
    Promise.resolve(document.fonts?.ready).then(advance, advance);
    ['/brand/dollar-logo.png', ...initialPosters.current].forEach(source => {
      const image = new Image();
      images.push(image);
      image.onload = image.onerror = advance;
      image.src = source;
    });
    const tick = now => {
      if (disposed) return;
      const elapsed = now - started;
      // A failed asset or slow connection must never trap the visitor.
      const finished = (completed >= tasks || elapsed >= 5000) && elapsed >= (reduced ? 150 : 1900);
      const goal = finished ? 100 : Math.min(target, 92);
      shown += (goal - shown) * (reduced ? 1 : .11);
      setProgress(Math.round(shown));
      if (finished && shown >= 99.5) {
        setProgress(100); setLeaving(true);
        exitTimer = setTimeout(onComplete, reduced ? 150 : 760);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true; cancelAnimationFrame(frame); clearTimeout(exitTimer);
      images.forEach(image => { image.onload = image.onerror = null; });
    };
  }, [reduced, onComplete]);
  return (
    <div className={`studio-preloader${mobileMode ? ' mobile-preloader' : ''}${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Preparing Dollar Creative Lab" aria-live="off">
      <div className="preload-shutter shutter-top"/><div className="preload-shutter shutter-bottom"/>
      <div className="preload-composition">
        <div className="preload-topline"><span>DOLLAR®<br/>CREATIVE LAB</span><span>POST PRODUCTION HOUSE<br/><i>CAIRO / WORLDWIDE</i></span></div>
        <div className="preload-center">
          <div className="preload-reel" aria-hidden="true"><i/><i/><i/><span>$</span></div>
          <span className="preload-eyebrow">BEFORE THE FIRST FRAME</span>
          <div className="preload-word preload-brand-word" aria-hidden="true"><BrandLogo decorative eager className="brand-logo-hero"/></div>
          <div className="preload-disciplines"><span>EDITING</span><i/><span>COLORING</span><i/><span>SOUND</span><i/><span>FINISHING</span></div>
        </div>
        <div className="preload-bottomline"><span>{progress===100 ? 'THE STAGE IS YOURS' : 'PREPARING THE FIRST FRAME'}<small>FONTS / OPENING ARTWORK</small></span><span className="preload-counter">{String(progress).padStart(3,'0')}<small>%</small></span></div>
        <div className="preload-track" role="progressbar" aria-label="Opening artwork loading" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{transform:`scaleX(${progress/100})`}}/></div>
      </div>
    </div>
  );
}
