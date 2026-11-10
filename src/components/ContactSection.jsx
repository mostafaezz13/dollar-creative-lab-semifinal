import React, { useRef } from 'react';
import useReveal from '../hooks/useReveal.js';
import useScrollScene from '../hooks/useScrollScene.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function ContactSection({ onBack, onScrollTop, scrollOffset = 0 }) {
  const containerRef = useRef(null);
  const reduced = useReducedMotion();
  useReveal(containerRef, '.cult-eyebrow, .cult-contact-main-heading, .cult-contact-card');
  useScrollScene(containerRef, scrollOffset);
  const tilt = event => {
    if (reduced || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty('--card-rx', `${(y-.5)*-8}deg`);
    event.currentTarget.style.setProperty('--card-ry', `${(x-.5)*10}deg`);
    event.currentTarget.style.setProperty('--light-x', `${x*100}%`);
    event.currentTarget.style.setProperty('--light-y', `${y*100}%`);
  };
  const reset = event => { event.currentTarget.style.setProperty('--card-rx','0deg'); event.currentTarget.style.setProperty('--card-ry','0deg'); };
  return (
    <section id="contactSection" ref={containerRef} className="cult-section kinetic-contact" aria-label="Contact Dollar Creative Lab">
      <div className="contact-space" aria-hidden="true"><span>CONTACT</span><i className="contact-orbit"/><i className="contact-orbit orbit-alt"/></div>
      <div id="contactInner" className="cult-section-inner">
        <div className="cult-eyebrow"><i className="availability-dot"/> OPEN FOR THE NEXT GREAT STORY</div>
        <div className="cult-contact-wrap">
          <div><span className="contact-chapter">CAIRO × LOS ANGELES / WORLDWIDE</span><h2 className="cult-contact-main-heading">Let’s make<span>the next cut.</span></h2><p className="contact-intro">For directors, creators and brands with a story worth telling. Bring the idea. We’ll shape what comes next.</p><a className="contact-project-link" href="mailto:contact@dollarcreativelab.com">START A PROJECT <span aria-hidden="true">↗</span></a></div>
          <div className="cult-contact-card"><div className="contact-details" onPointerMove={tilt} onPointerLeave={reset}>
            <span className="contact-card-index">LET’S TALK / 01</span>
            <div className="cult-contact-meta-group"><div className="cult-contact-meta-label">DIRECT INQUIRIES &amp; BOOKINGS</div><a href="mailto:contact@dollarcreativelab.com" className="cult-contact-big-email">contact@dollarcreativelab.com</a></div>
            <div className="cult-contact-meta-group"><div className="cult-contact-meta-label">STUDIO ADDRESS</div><div className="cult-contact-address-text">5619 4th St<br/>Los Angeles, CA 90036</div></div>
            <div className="cult-social-links"><a href="https://instagram.com" target="_blank" rel="noreferrer" className="cult-social-link">Instagram ↗</a><a href="https://vimeo.com" target="_blank" rel="noreferrer" className="cult-social-link">Vimeo ↗</a><a href="https://behance.net" target="_blank" rel="noreferrer" className="cult-social-link">Behance ↗</a></div>
          </div></div>
        </div>
        <div className="contact-marquee" aria-hidden="true"><div>{[0,1,2,3].map(i=><span key={i}>GOOD STORIES DESERVE A GREAT FINISH. <em>LET’S TALK ↗</em> </span>)}</div></div>
        <div className="cult-contact-footer"><button id="contactBackBtn" className="archive-back-btn" onClick={onBack}>← BACK TO WORK</button><span>© {new Date().getFullYear()} DOLLAR CREATIVE LAB</span><button id="contactScrollTopBtn" className="cult-next-btn" onClick={onScrollTop}>BACK TO START ↑</button></div>
      </div>
    </section>
  );
}
