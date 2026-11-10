import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import Preloader from './components/Preloader.jsx';
import CardTunnel from './components/CardTunnel.jsx';
import EndingScreen from './components/EndingScreen.jsx';
import AboutSection from './components/AboutSection.jsx';
import ShowreelSection from './components/ShowreelSection.jsx';
import WorkSection from './components/WorkSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import VideoModal from './components/VideoModal.jsx';
import AdminModal from './components/AdminModal.jsx';
import useReducedMotion from './hooks/useReducedMotion.js';
import FilmPlayer from './components/FilmPlayer.jsx';
import { parseVimeoUrl } from './utils/vimeo.js';
import { createEndingGate, advanceEndingGate } from './utils/endingGate.js';
import { DEFAULT_PROJECTS, INITIAL_CARDS, PROJECTS_STORAGE_KEY } from './data/projects.js';

const TUNNEL_PROJECT_LIMIT = 10;

export default function App() {
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(p => p && typeof p === 'object' && typeof p.title === 'string' && (typeof p.id === 'string' || typeof p.id === 'number'))) return parsed.map(p => ({ ...p, client: String(p.client || ''), category: String(p.category || '').replace(/\bEDIT\b/gi,'EDITING').replace(/\bVFX\b/gi,'FINISHING'), role: String(p.role || '').replace(/\bEDIT\b/gi,'EDITING').replace(/\bVFX\b/gi,'FINISHING'), year: String(p.year || '') }));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return DEFAULT_PROJECTS;
  });

  // 3D & Scroll state
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const reducedMotion = useReducedMotion();
  const [adminOpen, setAdminOpen] = useState(false);
  const [storageError, setStorageError] = useState('');
  const closeAdmin = useCallback(() => setAdminOpen(false), []);
  const closeProject = useCallback(() => setActiveModalProject(null), []);
  const cards = useMemoCards(INITIAL_CARDS, projects);
  const maxZ = Math.max(0,...cards.map(card => -card.z)) * (isMobile ? 1.4 : 1) + 1500;
  const brandStart = maxZ - 200;
  const endingGateRef = useRef(createEndingGate());
  const gestureRef = useRef({ wheel: 0, lastWheel: -Infinity, touch: 0, key: 0 });

  const [cameraZ, setCameraZ] = useState(0);
  const targetZRef = useRef(0);
  const cameraZRef = useRef(0);
  const rafRef = useRef(null);

  // Active theme (dark vs light) — mirrors legacy's isWhiteTheme
  const [theme, setTheme] = useState('dark');

  // Mobile navigation overlay (hamburger). When open it owns the screen,
  // so the custom wheel/touch scrolling must stand down.
  const [menuOpen, setMenuOpen] = useState(false);

  // Modal
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [projectOrigin, setProjectOrigin] = useState(null);
  const openProject = (project, element) => {
    const rect = element?.getBoundingClientRect();
    setProjectOrigin(rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null);
    targetZRef.current = cameraZRef.current;
    setActiveModalProject(project);
  };

  // Cursor preview (rendered at body level, z-index 120, like legacy)
  const [hoveredProject, setHoveredProject] = useState(null);
  const previewRef = useRef(null);

  // DOM Refs for dynamic offsets
  const trackRef = useRef(null);
  const aboutRef = useRef(null);
  const showreelRef = useRef(null);
  const workRef = useRef(null);
  const contactRef = useRef(null);

  const [totalMaxZ, setTotalMaxZ] = useState(maxZ);
  const [viewportH, setViewportH] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  );

  // Update scroll metrics based on track height
  const updateMetrics = useCallback(() => {
    const vh = window.innerHeight;
    setViewportH(vh);
    setIsMobile(window.innerWidth < 768);
    if (trackRef.current) {
      const trackHeight = trackRef.current.offsetHeight;
      const flowMax = Math.max(0, trackHeight - vh);
      setTotalMaxZ(maxZ + vh + flowMax);
    }
  }, [maxZ]);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    const observer = new ResizeObserver(updateMetrics);
    if (trackRef.current) observer.observe(trackRef.current);
    return () => { observer.disconnect(); window.removeEventListener('resize', updateMetrics); };
  }, [updateMetrics, projects]);

  useEffect(() => {
    targetZRef.current = Math.min(targetZRef.current, totalMaxZ);
  }, [totalMaxZ]);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  // Core Animation Loop (smooth lerp for cameraZ & scroll flow)
  useEffect(() => {
    let previousTime = 0;

    const loop = (time) => {
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 16.67;
      previousTime = time;
      const ease = reducedMotion ? 1 : 1 - Math.pow(isMobile ? 0.90 : 0.92, elapsed / 16.67);
      const diff = targetZRef.current - cameraZRef.current;
      cameraZRef.current += diff * ease;
      if (Math.abs(diff) < 0.25) cameraZRef.current = targetZRef.current;

      setCameraZ(cameraZRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, reducedMotion]);

  useLayoutEffect(() => {
    const section = workRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const clamp = value => Math.max(0, Math.min(1, value));
    const entering = clamp((viewportH * .95 - rect.top) / (viewportH * .8));
    const leaving = clamp((rect.bottom - viewportH * .05) / (viewportH * .8));
    const light = Math.min(entering, leaving);
    section.style.setProperty('--archive-light', String(light));
    setTheme(light > .5 ? 'light' : 'dark');
  }, [cameraZ, viewportH, totalMaxZ]);

  // Keep document.body in sync with the light theme (legacy toggles body.theme-light)
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  // Track global mouse position for the floating cursor preview
  useEffect(() => {
    const onMove = (e) => {
      if (previewRef.current) previewRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // One arrival gesture stops on the ending; only a fresh gesture continues.
  useEffect(() => {
    const moveScroll = (delta, gesture) => {
      targetZRef.current = advanceEndingGate(endingGateRef.current, {
        current: cameraZRef.current, target: targetZRef.current, delta, gesture, now: performance.now(),
        start: brandStart, hold: maxZ - 100, contentStart: maxZ + window.innerHeight, total: totalMaxZ
      });
    };
    const handleWheel = (e) => {
      if (booting || activeModalProject || adminOpen || menuOpen) return;
      if (e.ctrlKey || e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      const delta = (e.deltaY || e.deltaX) * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      const input = gestureRef.current;
      const now = performance.now();
      if (now - input.lastWheel > 240) input.wheel += 1;
      input.lastWheel = now;
      const mult = isMobile ? 1.6 : (cameraZRef.current > maxZ ? 1.15 : 1.5);
      moveScroll(delta * mult, `wheel-${input.wheel}`);
    };

    let touchLastY = 0;
    let touchVelocity = 0;
    let touchLastTime = 0;
    let touchActive = false;

    const handleTouchStart = (e) => {
      if (booting || activeModalProject || adminOpen || menuOpen) return;
      if (e.touches.length !== 1 || e.target.closest('input, textarea, select, .color-wipe')) { touchActive = false; return; }
      const video = e.target.closest('video');
      if (video && e.touches[0].clientY > video.getBoundingClientRect().bottom - 48) { touchActive = false; return; }
      gestureRef.current.touch += 1;
      touchLastY = e.touches[0].clientY;
      touchVelocity = 0;
      touchLastTime = Date.now();
      touchActive = true;
    };

    const handleTouchMove = (e) => {
      if (activeModalProject || adminOpen || menuOpen || !touchActive) return;
      if (e.touches.length !== 1) { touchActive = false; return; }
      e.preventDefault();
      const y = e.touches[0].clientY;
      const now = Date.now();
      const dt = now - touchLastTime;
      const dy = touchLastY - y;
      if (dt > 0) {
        const instantV = (dy / dt) * 1000;
        touchVelocity = touchVelocity * 0.3 + instantV * 0.7;
      }
      const touchMult = cameraZRef.current > maxZ ? 1.5 : 2.2;
      moveScroll(dy * touchMult, `touch-${gestureRef.current.touch}`);
      if (endingGateRef.current.holding) touchVelocity = 0;
      touchLastY = y;
      touchLastTime = now;
    };

    const handleTouchEnd = () => {
      if (!touchActive) return;
      touchActive = false;
      const momentum = reducedMotion ? 0 : touchVelocity * 0.35;
      moveScroll(momentum, `touch-${gestureRef.current.touch}`);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    const cancelTouch = () => { touchActive = false; touchVelocity = 0; };
    window.addEventListener('touchcancel', cancelTouch, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', cancelTouch);
    };
  }, [totalMaxZ, maxZ, isMobile, activeModalProject, adminOpen, menuOpen, reducedMotion, brandStart, booting]);

  // Keyboard navigation (legacy: ArrowDown/Right +380, ArrowUp/Left -380, Escape closes modal)
  useEffect(() => {
    const onKey = (e) => {
      if (booting) return;
      if (e.defaultPrevented || e.target.closest('input, textarea, select, [contenteditable=true]') || adminOpen) return;
      if (activeModalProject && e.key === 'Escape') {
        setActiveModalProject(null);
        return;
      }
      if (menuOpen) {
        if (e.key === 'Escape') setMenuOpen(false);
        return;
      }
      if (activeModalProject) return;
      if (!e.repeat) gestureRef.current.key += 1;
      if (e.key === 'Home' || e.key === 'End') {
        Object.assign(endingGateRef.current, createEndingGate(), { released: e.key === 'End' });
        e.preventDefault(); targetZRef.current = e.key === 'Home' ? 0 : totalMaxZ;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        targetZRef.current = advanceEndingGate(endingGateRef.current, {
          current: cameraZRef.current, target: targetZRef.current, delta: 380, gesture: `key-${gestureRef.current.key}`,
          now: performance.now(), start: brandStart, hold: maxZ - 100, contentStart: maxZ + window.innerHeight, total: totalMaxZ
        });
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        targetZRef.current = advanceEndingGate(endingGateRef.current, {
          current: cameraZRef.current, target: targetZRef.current, delta: -380, gesture: `key-${gestureRef.current.key}`,
          now: performance.now(), start: brandStart, hold: maxZ - 100, contentStart: maxZ + window.innerHeight, total: totalMaxZ
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalMaxZ, activeModalProject, adminOpen, menuOpen, brandStart, maxZ, booting]);

  // Navigation jumping to exact section offsets
  const handleNavigate = (target) => {
    setMenuOpen(false);
    Object.assign(endingGateRef.current, createEndingGate(), { released: typeof target !== 'number' || target > maxZ });
    if (typeof target === 'number') {
      targetZRef.current = target;
      return;
    }

    let sectionEl = null;
    if (target === 'about') sectionEl = aboutRef.current;
    if (target === 'services') sectionEl = document.getElementById('craftStudio');
    if (target === 'showreel') sectionEl = showreelRef.current;
    if (target === 'work') sectionEl = workRef.current;
    if (target === 'contact') sectionEl = contactRef.current;

    if (sectionEl) {
      const relativeTop = sectionEl.getBoundingClientRect().top - trackRef.current.getBoundingClientRect().top;
      const headerOffset = target === 'services' ? (isMobile ? 90 : 110) : 0;
      targetZRef.current = Math.min(totalMaxZ, maxZ + viewportH + Math.max(0, relativeTop - headerOffset));
    }
  };

  const saveProjects = (next) => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
      setProjects(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError('Could not save. Browser storage may be full or unavailable.');
      return false;
    }
  };

  // Continuous scroll offset calculation.
  // 1) When cameraZ <= maxZ: CardTunnel is active. Content track is parked below the screen (100vh).
  // 2) At ctaThreshold: EndingScreen appears and stays completely PINNED / FIXED in place.
  // 3) When cameraZ > maxZ and < maxZ + viewportH: Content track rolls up smoothly from bottom.
  // 4) Beyond maxZ + viewportH: Content track scrolls seamlessly through About -> Showreel -> Work -> Contact.
  const contentStart = maxZ + viewportH;
  let trackY;
  if (cameraZ >= contentStart) {
    const flowOffset = cameraZ - contentStart;
    trackY = `${-flowOffset}px`;
  } else if (cameraZ > maxZ) {
    const rollProgress = (cameraZ - maxZ) / Math.max(1, viewportH);
    trackY = `calc(var(--app-vh) * ${(1 - rollProgress).toFixed(4)})`;
  } else {
    trackY = 'var(--app-vh)';
  }
  const trackTransform = `translate3d(0, ${trackY}, 0)`;

  const ctaThreshold = brandStart;
  const isEndingVisible = cameraZ >= ctaThreshold && cameraZ < contentStart;

  const isLight = theme === 'light';
  const showCursorPreview = !!hoveredProject;
  const previewVisual = hoveredProject?.previewVisual || '';
  const isVideo = Boolean(parseVimeoUrl(previewVisual)) || previewVisual.startsWith('data:video/') || /\.(mp4|webm|mov)$/i.test(previewVisual);
  const isImage = previewVisual.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(previewVisual);
  const monogram =
    (hoveredProject?.client || 'DL').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'DL';

  return (
    <>
      {booting && <Preloader posters={projects.map(project => project.poster)} onComplete={finishBoot}/>}
      <div id="studioApp" inert={booting ? '' : undefined} aria-hidden={booting ? true : undefined}>
      {/* Header */}
      <Header
        theme={theme}
        onNavigate={handleNavigate}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onAdmin={() => { setMenuOpen(false); setAdminOpen(true); }}
      />

      {/* Phase 1: 3D Card Tunnel */}
      <CardTunnel
        cards={cards}
        cameraZ={cameraZ}
        maxZ={maxZ}
        paused={booting || Boolean(activeModalProject) || menuOpen || cameraZ > maxZ}
        onCardClick={(card, element) => {
          if (card.project) openProject(card.project, element);
        }}
      />

      {/* Dedicated Black Ending Screen (Pinned at the end of the 3D Tunnel) */}
      <EndingScreen
        visible={isEndingVisible}
        onEnterWork={() => handleNavigate('work')}
        onContinue={() => handleNavigate('about')}
      />

      {/* Phase 2: Continuous Flow Track (About -> Showreel -> Work -> Contact) */}
      <div
        id="pageContentWrapper"
        className={`page-content-wrapper${isLight ? ' theme-light' : ''}`}
        style={{ pointerEvents: cameraZ >= contentStart - 100 ? 'auto' : 'none' }}
      >
        <div
          id="pageContentTrack"
          ref={trackRef}
          className={`page-content-track${isLight ? ' theme-light' : ''}`}
          style={{ transform: trackTransform }}
        >
          <div ref={aboutRef}>
            <AboutSection
              onNext={() => handleNavigate('showreel')}
              scrollOffset={cameraZ}
            />
          </div>

          <div ref={showreelRef}>
            <ShowreelSection
              onBack={() => handleNavigate('about')}
              onNext={() => handleNavigate('work')}
              scrollOffset={cameraZ}
            />
          </div>

          <div ref={workRef}>
            <WorkSection
              projects={projects}
              onProjectClick={openProject}
              onBack={() => handleNavigate('showreel')}
              onNext={() => handleNavigate('contact')}
              onRowHover={(p) => setHoveredProject(p)}
              scrollOffset={cameraZ}
            />
          </div>

          <div ref={contactRef}>
            <ContactSection
              onBack={() => handleNavigate('work')}
              onScrollTop={() => handleNavigate(0)}
              scrollOffset={cameraZ}
            />
          </div>
        </div>
      </div>

      {/* Floating Cursor Preview (body-level, z-index 120) */}
      <div
        ref={previewRef}
        id="cursorPreview"
        className={`cursor-preview${showCursorPreview ? ' visible' : ''}`}
        aria-hidden="true"
        style={{
          transform: 'translate3d(-9999px, -9999px, 0)'
        }}
      >
        <div className="cursor-preview-bg" />
        <div className="cursor-preview-media-wrap">
          {showCursorPreview && isVideo && (
            <FilmPlayer className="cursor-preview-media" title={hoveredProject.title} source={previewVisual} poster={hoveredProject.poster} background muted loop controls={false} autoplay />
          )}
          {showCursorPreview && !isVideo && isImage && (
            <img className="cursor-preview-media" src={previewVisual} alt="" />
          )}
          {showCursorPreview && !isVideo && !isImage && (
            <div className="cursor-preview-fallback">
              <div className="fallback-monogram" id="fallbackMonogram">{monogram}</div>
              <div className="fallback-details">
                <span className="fallback-client" id="fallbackClient">{hoveredProject.client || 'DOLLAR'}</span>
                <span className="fallback-title" id="fallbackTitle">{hoveredProject.title || 'PROJECT'}</span>
              </div>
            </div>
          )}
        </div>
        <div className="cursor-preview-scanline" />
      </div>

      {/* Scroll hint — replicated verbatim (legacy ships it as "visible hidden" and
          only ever adds "hidden", so it stays at opacity 0) */}
      <button id="scrollHint" className={cameraZ < 250 ? 'visible' : 'hidden'} onClick={() => handleNavigate(900)}>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></button>

      {/* Progress bar (bottom, theme-aware) */}
      <div
        id="progressBar"
        style={{
          width: `${Math.min(100, (cameraZ / totalMaxZ) * 100)}%`,
          backgroundColor: isLight ? 'rgba(8, 8, 11, 0.25)' : 'rgba(245, 243, 247, 0.25)',
          transition: 'background-color 1.2s ease'
        }}
      />

      {adminOpen && <AdminModal projects={projects} onSave={saveProjects} onClose={closeAdmin} error={storageError} />}
      {/* Video Modal */}
      {activeModalProject && (
        <VideoModal project={activeModalProject} origin={projectOrigin} onClose={closeProject} />
      )}
      </div>
    </>
  );
}

// Helper hook to map projects data to initial 3D card layout
function useMemoCards(initialCards, projects) {
  return React.useMemo(() => projects.slice(0, TUNNEL_PROJECT_LIMIT).map((project, index) => {
    const layout = initialCards[index] || {
      ...initialCards[index % initialCards.length],
      z: initialCards.at(-1).z - (index - initialCards.length + 1) * 550
    };
    return { ...layout, idx: String(index + 1).padStart(2,'0'), project,
      title: project.title, sub: project.client || 'Dollar Creative Lab', tag: project.category || 'POST PRODUCTION' };
  }), [initialCards, projects]);
}
