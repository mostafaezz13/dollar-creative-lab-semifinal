import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import CardTunnel from './components/CardTunnel.jsx';
import EndingScreen from './components/EndingScreen.jsx';
import AboutSection from './components/AboutSection.jsx';
import ShowreelSection from './components/ShowreelSection.jsx';
import WorkSection from './components/WorkSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import VideoModal from './components/VideoModal.jsx';
import AdminModal from './components/AdminModal.jsx';
import useReducedMotion from './hooks/useReducedMotion.js';
import { DEFAULT_PROJECTS, INITIAL_CARDS } from './data/projects.js';

export default function App() {
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('dollar_projects_v2');
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
  const maxZ = Math.max(...INITIAL_CARDS.map(card => -card.z)) * (isMobile ? 1.4 : 1) + 1500;
  const brandStart = maxZ - 200;

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

  // Combine initial 3D cards with current projects data
  const cards = useMemoCards(INITIAL_CARDS, projects);

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

      // Seamless theme toggle: Work starts dark on arrival (black),
      // and smoothly transitions to light (white) as soon as the section reaches halfway into view.
      if (workRef.current) {
        const rect = workRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const isWhite = rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5;
        setTheme(isWhite ? 'light' : 'dark');
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, reducedMotion]);

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

  // Wheel and Touch Event Handlers (mirror legacy's scroll speed model)
  useEffect(() => {
    const handleWheel = (e) => {
      if (activeModalProject || adminOpen || menuOpen) return;
      if (e.ctrlKey || e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      const delta = (e.deltaY || e.deltaX) * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (delta > 0 && cameraZRef.current >= brandStart && cameraZRef.current < maxZ + window.innerHeight) {
        targetZRef.current = maxZ + window.innerHeight + 40;
        return;
      }
      const mult = isMobile ? 1.6 : (cameraZRef.current > maxZ ? 1.15 : 1.5);
      targetZRef.current = Math.max(0, Math.min(totalMaxZ, targetZRef.current + delta * mult));
    };

    let touchLastY = 0;
    let touchVelocity = 0;
    let touchLastTime = 0;
    let touchActive = false;

    const handleTouchStart = (e) => {
      if (activeModalProject || adminOpen || menuOpen) return;
      if (e.touches.length !== 1 || e.target.closest('input, textarea, select, .color-wipe')) { touchActive = false; return; }
      const video = e.target.closest('video');
      if (video && e.touches[0].clientY > video.getBoundingClientRect().bottom - 48) { touchActive = false; return; }
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
      if (dy > 0 && cameraZRef.current >= brandStart && cameraZRef.current < maxZ + window.innerHeight) {
        targetZRef.current = maxZ + window.innerHeight + 40;
        touchVelocity = 0;
        return;
      }
      const touchMult = cameraZRef.current > maxZ ? 1.5 : 2.2;
      targetZRef.current = Math.max(0, Math.min(totalMaxZ, targetZRef.current + dy * touchMult));
      touchLastY = y;
      touchLastTime = now;
    };

    const handleTouchEnd = () => {
      if (!touchActive) return;
      touchActive = false;
      const momentum = reducedMotion ? 0 : touchVelocity * 0.35;
      targetZRef.current = Math.max(0, Math.min(totalMaxZ, targetZRef.current + momentum));
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
  }, [totalMaxZ, maxZ, isMobile, activeModalProject, adminOpen, menuOpen, reducedMotion, brandStart]);

  // Keyboard navigation (legacy: ArrowDown/Right +380, ArrowUp/Left -380, Escape closes modal)
  useEffect(() => {
    const onKey = (e) => {
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
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault(); targetZRef.current = e.key === 'Home' ? 0 : totalMaxZ;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        targetZRef.current = Math.max(0, Math.min(totalMaxZ, targetZRef.current + 380));
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        targetZRef.current = Math.max(0, Math.min(totalMaxZ, targetZRef.current - 380));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalMaxZ, activeModalProject, adminOpen, menuOpen]);

  // Navigation jumping to exact section offsets
  const handleNavigate = (target) => {
    setMenuOpen(false);
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
      localStorage.setItem('dollar_projects_v2', JSON.stringify(next));
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
  const isVideo = previewVisual.startsWith('data:video/') || /\.(mp4|webm|mov)$/i.test(previewVisual);
  const isImage = previewVisual.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(previewVisual);
  const monogram =
    (hoveredProject?.client || 'DL').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'DL';

  return (
    <>
      <div className="cinema-intro" aria-hidden="true"><span className="intro-brand">DOLLAR CREATIVE LAB<span className="intro-sub">POST PRODUCTION HOUSE</span></span></div>
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
        paused={Boolean(activeModalProject) || menuOpen || cameraZ > maxZ}
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
            <video className="cursor-preview-media" muted playsInline loop autoPlay src={previewVisual} />
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
          backgroundColor: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)',
          transition: 'background-color 1.2s ease'
        }}
      />

      {adminOpen && <AdminModal projects={projects} onSave={saveProjects} onClose={closeAdmin} error={storageError} />}
      {/* Video Modal */}
      {activeModalProject && (
        <VideoModal project={activeModalProject} origin={projectOrigin} onClose={closeProject} />
      )}
    </>
  );
}

// Helper hook to map projects data to initial 3D card layout
function useMemoCards(initialCards, projects) {
  return React.useMemo(() => {
    if (!projects.length) return [];
    return initialCards.map((card, idx) => {
      const p = projects[idx % projects.length];
      if (p) {
        return {
          ...card,
          project: p,
          title: p.title || card.title,
          sub: p.client || card.sub,
          tag: p.category || card.tag
        };
      }
      return card;
    });
  }, [initialCards, projects]);
}
