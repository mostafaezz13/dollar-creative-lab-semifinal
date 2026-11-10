import React from 'react';

export default function EndingScreen({ onEnterWork, onContinue, visible = true }) {
  return (
    <section id="blackEndingScreen" className={`black-ending-screen${visible ? ' visible' : ''}`} aria-label="Dollar Creative Lab" aria-hidden={!visible} inert={!visible ? '' : undefined}>
      <div className="brand-motion" aria-hidden="true"><div className="brand-grid"/><i className="brand-orbit orbit-one"/><i className="brand-orbit orbit-two"/><i className="brand-glow"/>{[0,1,2,3].map(i=><span className={`brand-trail trail-${i}`} key={i}/>)}</div>
      <div className="ending-screen-content">
        <span className="brand-kicker">THE ART OF WHAT COMES NEXT</span>
        <h2 className="ending-wordmark">{['DOLLAR','CREATIVE','LAB'].map((word,i)=><span key={word} style={{'--word-index':i}}>{word}</span>)}</h2>
        <div className="ending-sub">POST PRODUCTION HOUSE</div>
        <div className="ending-buttons"><button id="viewWorkBtn" className="view-work-btn" onClick={onEnterWork}>VIEW WORK ↗</button><button className="ending-roster-link" onClick={onContinue}>MEET THE STUDIO ↓</button></div>
        <button type="button" className="ending-scroll-indicator" id="endingScrollIndicator" onClick={onContinue}><span className="scroll-indicator-text">SCROLL AGAIN TO CONTINUE</span><span className="ending-scroll-arrow">↓</span></button>
      </div>
    </section>
  );
}
