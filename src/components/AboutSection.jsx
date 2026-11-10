import React, { useEffect, useRef, useState } from 'react';
import useReveal from '../hooks/useReveal.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import SplitText from './SplitText.jsx';
import CraftStudio from './CraftStudio.jsx';

// Highlight words for the scroll-driven color reveal
const ABOUT_HERO_TOKENS = [
  { text: 'We', bold: false },
  { text: 'do', bold: false },
  { text: 'revolutionary', bold: false },
  { text: 'Post-Production', bold: true, italic: true },
  { text: '&', bold: false },
  { text: 'create', bold: false },
  { text: 'projects', bold: false },
  { text: 'that', bold: false },
  { text: 'we', bold: false },
  { text: 'believe', bold: false },
  { text: 'in.', bold: false },
  { text: 'From', bold: false },
  { text: 'our', bold: false },
  { text: 'Cairo', bold: false },
  { text: '&', bold: false },
  { text: 'LA', bold: false },
  { text: 'studios', bold: false },
  { text: 'and', bold: false },
  { text: 'beyond,', bold: false },
  { text: 'we', bold: false },
  { text: 'bring', bold: false },
  { text: 'a', bold: false },
  { text: 'BOLD', bold: true, italic: true },
  { text: 'vision,', bold: true, italic: true },
  { text: 'considered', bold: false },
  { text: 'innovation,', bold: false },
  { text: 'and', bold: false },
  { text: 'exceptional', bold: false },
  { text: 'craft.', bold: false }
];

export default function AboutSection({ onNext, scrollOffset = 0 }) {
  const containerRef = useRef(null);
  const isInView = useReveal(containerRef, '.cult-eyebrow, .cult-about-subtext, .cult-services-title, .cult-service-card, .cult-quote-banner');
  const reduced = useReducedMotion();
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 900;
    

    // Scroll-to-reveal scrub progress:
    // Starts when the lead heading itself enters comfortably into the center/lower half of screen
    const heroEl = el.querySelector('.cult-about-hero');
    const heroRect = heroEl ? heroEl.getBoundingClientRect() : rect;
    
    // We calibrate reveal to start when heading reaches around 65% of viewport height.
    // If the scroll moved past the heading (heroRect.bottom <= startY or user scrolled under it),
    // progress stays locked at 1 so all words stay 100% visible and revealed!
    const startY = vh * 0.65;
    const scrollDistance = 500;
    
    let currentProgress;
    if (heroRect.top < startY - scrollDistance || heroRect.bottom < vh * 0.5) {
      currentProgress = 1; // Passed the text / scrolled under it -> fully visible!
    } else {
      currentProgress = Math.max(0, Math.min(1, (startY - heroRect.top) / scrollDistance));
    }
    setRevealProgress(currentProgress);

  }, [scrollOffset]);

  const totalWords = ABOUT_HERO_TOKENS.length;

  return (
    <section
      id="aboutSection"
      ref={containerRef}
      className="cult-section"
      aria-label="About Dollar Creative Lab"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <div id="aboutInner" className="cult-section-inner">
        <div className="cult-eyebrow" style={{ opacity: 0, transform: 'translateY(25px)' }}>
          <SplitText type="chars" inView={isInView} stagger={0.03}>
            About Dollar
          </SplitText>
        </div>

        <div className="cult-about-hero">
          {/* Scroll to Reveal Word-by-Word Hero */}
          <h1 className="cult-about-lead" style={{ perspective: '800px', transformStyle: 'preserve-3d' }}>
            {ABOUT_HERO_TOKENS.map((token, index) => {
              // Word lights up as user scrolls through the section with a smooth buffer
              const wordStep = index / totalWords;
              const isLit = reduced || revealProgress >= wordStep;
              // Smooth transition factor
              const factor = Math.max(0, Math.min(1, (revealProgress - (wordStep - 0.08)) / 0.12));
              const wordOpacity = reduced ? 1 : 0.45 + factor * 0.55;

              return (
                <span
                  key={index}
                  className="inline-block mr-[0.28em]"
                  style={{
                    color: isLit ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                    opacity: wordOpacity,
                    transform: isLit ? 'translateY(0) scale(1)' : 'translateY(3px) scale(0.97)',
                    textShadow: isLit ? '0 0 18px rgba(255,255,255,0.3)' : 'none',
                    transition: 'color 0.45s ease, opacity 0.45s ease, transform 0.45s ease, text-shadow 0.45s ease',
                    display: 'inline-block'
                  }}
                >
                  {token.italic ? <em>{token.text}</em> : token.text}
                </span>
              );
            })}
          </h1>

          <p className="cult-about-subtext" style={{ opacity: 0, transform: 'translateY(25px)' }}>
            Dollar Creative Lab was founded to shape culture through striking visual storytelling. We believe that the future of filmmaking lies in the unbreakable bond between pre-production, on-set vision, and post-production mastery.
          </p>
        </div>

        <CraftStudio scrollOffset={scrollOffset} />

        <div className="cult-quote-banner" style={{ opacity: 0, transform: 'translateY(30px) scale(0.97)' }}>
          <div className="cult-quote-text">
            &quot;We are fascinated with projects that are post-production driven &amp; carry a high artistic appeal — transforming raw footage into enduring cinematic moments.&quot;
          </div>
          <button
            id="aboutToShowreelBtn"
            className="cult-next-btn group"
            type="button"
            onClick={onNext}
          >
            <span>WATCH SHOWREEL</span> →
          </button>
        </div>
      </div>
    </section>
  );
}
