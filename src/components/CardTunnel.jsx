import React, { useState, useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';
import { PLACEHOLDER_VIDEO, PLACEHOLDER_POSTER } from '../data/projects.js';

const EXIT_DIRS = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -0.7, y: 0.7 },
  { x: 0.7, y: 0.7 }
];
const EXIT_ORDER = [1, 0, 4, 1, 3, 0, 2, 1, 0, 3, 1, 4, 0];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function CardTunnel({ cards, cameraZ, maxZ, onCardClick, paused = false }) {
  const reducedMotion = useReducedMotion();
  const rigRef = useRef(null);
  const viewportRef = useRef(null);
  const motionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  useEffect(() => {
    const rig = rigRef.current;
    if (reducedMotion) { rig.style.transform = 'none'; return; }
    if (paused) return;
    let frame;
    const motion = motionRef.current;
    const move = event => {
      if (event.pointerType === 'touch') return;
      motion.targetX = (event.clientX / window.innerWidth - .5) * 2;
      motion.targetY = (event.clientY / window.innerHeight - .5) * 2;
    };
    const reset = () => { motion.targetX = 0; motion.targetY = 0; };
    const loop = time => {
      motion.x += (motion.targetX - motion.x) * .055;
      motion.y += (motion.targetY - motion.y) * .055;
      rig.style.transform = `rotateX(${-motion.y * 5}deg) rotateY(${motion.x * 7}deg) translate3d(${-motion.x * 20}px, ${-motion.y * 16 + Math.sin(time * .0007) * 5}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', reset);
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', reset); };
  }, [reducedMotion, paused]);
  const [windowSize, setWindowSize] = useState({
    vw: typeof window !== 'undefined' ? window.innerWidth : 1440,
    vh: typeof window !== 'undefined' ? window.innerHeight : 900
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ vw: window.innerWidth, vh: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { vw, vh } = windowSize;
  const isMobile = vw < 768;

  const spread = isMobile ? 1.2 : 1.6;
  const spreadY = isMobile ? 2.4 : spread;
  const zStretch = isMobile ? 1.4 : 1.0;

  // Scene is clamped to maxZ; per-card optics use the raw cameraZ (matches legacy).
  const clampedCameraZ = Math.min(cameraZ, maxZ);

  const focusRange = 400;
  const convergeStart = -2000;
  const convergeEnd = 0;
  const exitStart = 650;

  return (
    <div id="viewport" ref={viewportRef} aria-hidden={cameraZ > maxZ} style={{ pointerEvents: 'none' }}>
      <div className="tunnel-atmosphere" aria-hidden="true" />
      <div className="tunnel-hud" aria-hidden="true" style={{ opacity: cameraZ < maxZ - 900 ? 1 : 0 }}>
        <span>SELECTED WORK / VOL. 01</span><span>DEPTH {String(Math.round(cameraZ)).padStart(5, '0')} M</span>
      </div>
      <div className="camera-rig" ref={rigRef}>
      <div
        id="scene"
        style={{
          visibility: 'visible',
          transform: `translateZ(${clampedCameraZ}px)`
        }}
      >
        <div className="depth-grid" aria-hidden="true" />
        {['EDITING', 'COLOR', 'FINISHING', 'SOUND'].map((word, index) => {
          const z = (-800 - index * 2200) * zStretch;
          const relative = z + cameraZ;
          return <div key={word} className={`depth-type depth-type-${index}`} aria-hidden="true" style={{
            transform: `translate(-50%, -50%) translate3d(${index % 2 ? 180 : -180}px, ${index % 2 ? -250 : 260}px, ${z}px) rotateY(${index % 2 ? -12 : 12}deg)`,
            opacity: clamp((1600 - relative) / 1000, 0, 1), visibility: relative > 1600 ? 'hidden' : 'visible'
          }}><span className="depth-type-index">0{index + 1} / DISCIPLINE</span>{word}</div>;
        })}
        {cards.map((card, i) => {
          const z = card.z * zStretch;
          const effectiveZ = z + cameraZ;

          // Convergence lerp toward center
          let cf = 0;
          if (effectiveZ >= convergeEnd) {
            cf = 1;
          } else if (effectiveZ > convergeStart) {
            cf = (effectiveZ - convergeStart) / (convergeEnd - convergeStart);
          }

          const curX = card.x * spread * (1 - cf);
          const curY = card.y * spreadY * (1 - cf);
          const curRx = card.rx * 2.4 * (1 - cf);
          const curRy = card.ry * 3 * (1 - cf);

          // Focus scaling
          const targetFocusW = isMobile ? vw * 0.7 : vw * 0.42;
          const cardW = isMobile ? Math.round(card.w * 0.55) : card.w;
          const cardH = isMobile ? Math.round(card.h * 0.55) : card.h;
          const scaleByW = targetFocusW / cardW;
          const maxH = vh * 0.45;
          const scaleByH = maxH / cardH;
          const fullScale = isMobile ? Math.min(scaleByW, scaleByH) : scaleByW;

          // Exit transition
          let ep = 0;
          let exitOffsetX = 0;
          let exitOffsetY = 0;
          let exitShrink = 1;
          if (effectiveZ > exitStart) {
            ep = clamp((effectiveZ - exitStart) / 700, 0, 1);
            const easeOut = ep * ep;
            const exitDir = EXIT_DIRS[EXIT_ORDER[i % EXIT_ORDER.length]];
            exitOffsetX = exitDir.x * easeOut * vw * 0.9;
            exitOffsetY = exitDir.y * easeOut * vh * 0.9;
            exitShrink = 1 - ep;
          }

          let holdScale = 1;
          if (effectiveZ > 0) {
            const perspVal = isMobile ? 1200 : 2200;
            const perspMag = perspVal / Math.max(perspVal - effectiveZ, 100);
            const growEnd = 450;
            const targetSize = effectiveZ < growEnd
              ? 1 + (effectiveZ / growEnd) * (fullScale - 1)
              : fullScale;
            holdScale = Math.max((targetSize / perspMag) * exitShrink, 0.02);
          }

          // Brightness & distance — mirrors legacy's three-branch formula
          let brightness;
          if (effectiveZ > -focusRange) {
            brightness = 1;
          } else if (effectiveZ < -3000) {
            brightness = clamp(0.60 + 0.25 * (effectiveZ + 9000) / 6000, 0.60, 0.85);
          } else {
            const t = (effectiveZ + 3000) / (3000 - focusRange);
            brightness = clamp(0.70 + 0.30 * t * t, 0.70, 1);
          }

          const opacity = clamp(1 - ep, 0, 1);
          const isVisible = ep < 1;
          const isFocused = effectiveZ > 300 && ep < 0.4;

          const transformStyle =
            `translate(-50%, -50%) translate3d(` +
            `${(curX / 100) * vw + exitOffsetX}px, ` +
            `${(curY / 100) * vh + exitOffsetY}px, ` +
            `${z}px) ` +
            `rotateX(${curRx}deg) rotateY(${curRy}deg) scale(${holdScale})`;

          return (
            <div
              key={card.idx}
              className={`pcard cinematic-card card-tone-${i % 4}${isFocused ? ' in-focus' : ''}`}
              role="button"
              tabIndex={isVisible && effectiveZ > -4500 && cameraZ < maxZ && !paused ? 0 : -1}
              aria-label={`Play ${card.sub} — ${card.title}`}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onCardClick(card, event.currentTarget); } }}
              onClick={event => onCardClick(card, event.currentTarget)}
              style={{
                pointerEvents: isVisible && cameraZ < maxZ && !paused ? 'auto' : 'none',
                width: `${cardW}px`,
                height: `${cardH}px`,
                transform: transformStyle,
                opacity,
                filter: `brightness(${brightness})`,
                visibility: isVisible ? 'visible' : 'hidden'
              }}
            >
              <video
                muted
                loop
                playsInline
                autoPlay={!reducedMotion}
                preload="none"
                poster={!card.project?.poster || card.project.poster === PLACEHOLDER_POSTER ? ['/craft-frame-1.jpg', '/craft-frame-2.jpg', '/craft-frame-3.jpg', '/craft-frame-4.jpg', '/craft-frame-5.jpg'][i % 5] : card.project.poster}
                src={isVisible && effectiveZ > -1800 && effectiveZ < 1350 && !reducedMotion ? (card.project?.videoUrl || PLACEHOLDER_VIDEO) : undefined}
              />
              <span className="pcard-index">{card.idx}</span>
              <span className="pcard-tag">{card.tag}</span>
              <div className="pcard-content">
                <div className="pcard-title">{card.title}</div>
                <div className="pcard-subtitle">{card.sub}</div>
                <span className="card-play-label">PLAY FILM ↗</span>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      <div className="tunnel-heading" style={{ opacity: clamp(1 - cameraZ / 1400, 0, 1) }}><span>POST PRODUCTION / CAIRO × LOS ANGELES</span><h2>Beyond<em>the frame.</em></h2></div>
      <div className="tunnel-reticle" aria-hidden="true" style={{ opacity: cameraZ < 600 ? 1 : 0 }}><span>SCROLL TO TRAVEL</span><span>CLICK A FRAME TO ENTER</span></div>
    </div>
  );
}
