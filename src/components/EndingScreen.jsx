import React, { useRef } from 'react';
import BrandLogo from './BrandLogo.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';
import { DEFAULT_PROJECTS } from '../data/projects.js';

export default function EndingScreen({ onEnterWork, onContinue, visible = true }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const move = event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    root.current.style.setProperty('--ending-x',`${(event.clientX-rect.left)/rect.width-.5}`);
    root.current.style.setProperty('--ending-y',`${(event.clientY-rect.top)/rect.height-.5}`);
  };
  const reset = () => { root.current.style.setProperty('--ending-x','0'); root.current.style.setProperty('--ending-y','0'); };
  return (
    <section id="blackEndingScreen" ref={root} className={`black-ending-screen ending-manifesto${visible ? ' visible' : ''}`} aria-label="Dollar Creative Lab" aria-hidden={!visible} inert={!visible ? '' : undefined} onPointerMove={move} onPointerLeave={reset}>
      <div className="ending-environment" aria-hidden="true"><div className="ending-floor"/><div className="ending-aura"/><span className="ending-coordinate">DCL / THE NEXT DIMENSION</span></div>
      <div className="ending-sculpture" aria-hidden="true">
        <div className="sculpture-axis"><i className="chrome-loop loop-a"/><i className="chrome-loop loop-b"/><i className="chrome-loop loop-c"/><span className="chrome-dollar">$</span><span className="sculpture-satellite"/></div>
        <div className="ending-film-stack">{[1,4,7].map((index,i)=><div className={`ending-film film-${i}`} key={index}><img src={DEFAULT_PROJECTS[index]?.poster} alt="" loading="lazy"/><span>FRAME / 00{i+1}</span></div>)}</div>
        <span className="sculpture-caption">IDEAS IN. IMPACT OUT. ↗</span>
      </div>
      <div className="ending-screen-content">
        <div className="ending-chapter"><span>THE TUNNEL ENDS. THE STORY BEGINS.</span><span>01 — INFINITY</span></div>
        <span className="brand-kicker">INDEPENDENT MINDS. ONE CREATIVE LAB.</span>
        <h2 className="ending-wordmark" aria-label="Dollar Creative Lab">{['DOLLAR','CREATIVE','LAB'].map((word,i)=><span className="ending-word-mask" key={word}><span style={{'--word-index':i}}>{i===0 ? <BrandLogo decorative eager className="ending-brand-logo"/> : word}{i===2 && <sup>®</sup>}</span></span>)}</h2>
        <div className="ending-action-line"><p className="ending-sub">We shape the cut.<br/>You feel the difference.</p><div className="ending-buttons"><button id="viewWorkBtn" className="view-work-btn" onClick={onEnterWork}>VIEW WORK <span aria-hidden="true">↗</span></button><button className="ending-roster-link" onClick={onContinue}>MEET THE STUDIO <span aria-hidden="true">↓</span></button></div></div>
        <div className="ending-baseline"><span>EDITING / COLORING / SOUND / FINISHING</span><button type="button" className="ending-scroll-indicator" id="endingScrollIndicator" onClick={onContinue}><span className="scroll-indicator-text">SCROLL AGAIN TO CONTINUE</span><span className="ending-scroll-arrow" aria-hidden="true">↓</span></button><span>POST PRODUCTION. REIMAGINED.</span></div>
      </div>
    </section>
  );
}
