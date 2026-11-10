import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import useDialog from '../hooks/useDialog.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import { mediaUrl, safeCredits } from '../utils/content.js';

export default function VideoModal({ project, origin, onClose }) {
  const dialogRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const reducedMotion = useReducedMotion();
  const requestClose = useCallback(() => setClosing(true), []);
  useDialog(dialogRef, requestClose);
  const originTransform = () => {
    if (!origin || origin.width <= 0 || origin.height <= 0) return `translate(0px, ${window.innerHeight * .08}px) scale(.94)`;
    const width = stageRef.current?.offsetWidth || window.innerWidth;
    return `translate(${origin.left}px, ${origin.top}px) scale(${origin.width / width}, ${origin.height / window.innerHeight})`;
  };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    // Browser-composited FLIP: the animation does not depend on React or a JS frame loop.
    const animation = stage.animate([
      { transform: reducedMotion ? 'none' : originTransform(), borderRadius: '12px', opacity: reducedMotion ? 0 : 1 },
      { transform: 'translate(0px, 0px) scale(1)', borderRadius: '0px', opacity: 1 }
    ], { duration: reducedMotion ? 1 : 1050, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    animation.onfinish = () => { setEntered(true); videoRef.current?.play().catch(() => {}); };
    return () => animation.cancel();
  }, [reducedMotion, origin]);

  useEffect(() => {
    if (!closing) return;
    videoRef.current?.pause();
    dialogRef.current.scrollTop = 0;
    const animation = stageRef.current.animate([
      { transform: getComputedStyle(stageRef.current).transform, opacity: 1, borderRadius: '0px' },
      { transform: originTransform(), opacity: 0, borderRadius: '12px' }
    ], { duration: reducedMotion ? 1 : 650, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    animation.onfinish = onClose;
    return () => animation.cancel();
  }, [closing, onClose, reducedMotion, origin]);

  const display = project.client ? `${project.client} — ${project.title}` : project.title;
  const tags = (project.role || project.category || '').split('/').map(t => t.trim()).filter(Boolean);
  const source = mediaUrl(project.videoUrl || project.previewVisual);

  return (
    <div id="vModal" ref={dialogRef} className={`open cinema-dialog${entered ? ' entered' : ''}${closing ? ' returning' : ''}`} role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" tabIndex={-1} onClick={requestClose}>
      <button className="vm-close" onClick={requestClose} aria-label="Close project"><span>BACK TO FRAMES</span> ✕</button>
      <div className="project-cinema" ref={stageRef} onClick={e => e.stopPropagation()}>
        {source && !failed ? <video ref={videoRef} controls playsInline preload="auto" poster={mediaUrl(project.poster)} src={source} onError={() => setFailed(true)} /> : <p className="media-error" role="status">This film is currently unavailable. Please try again later.</p>}
        <div className="cinema-film-caption"><span>NOW SHOWING / {project.year}</span><h2 id="project-dialog-title">{display}</h2><div>{tags.join(' / ')}</div></div>
      </div>
      <div className="cinema-project-details" onClick={e => e.stopPropagation()}>
        <span className="dialog-eyebrow">DOLLAR CREATIVE LAB / FILM NOTES</span>
        <h3>{display}</h3>
        {project.credits && <div className="vm-credits" dangerouslySetInnerHTML={{ __html: safeCredits(project.credits) }} />}
        <ul className="vm-screenshots">{(Array.isArray(project.screenshots) ? project.screenshots : []).map((src, i) => <li key={i}><img src={mediaUrl(src)} alt={`${project.title} — still ${i + 1}`} loading="lazy" /></li>)}</ul>
        <button className="cult-next-btn" onClick={requestClose}>RETURN TO PROJECT ↗</button>
      </div>
    </div>
  );
}
