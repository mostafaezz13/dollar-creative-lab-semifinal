import React, { useEffect, useRef } from 'react';

export default function Header({ theme = 'dark', onNavigate, menuOpen = false, onToggleMenu, onAdmin }) {
  const isLight = theme === 'light';
  const headerRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement;
    headerRef.current.querySelector('nav a')?.focus();
    return () => previous?.focus();
  }, [menuOpen]);
  const handleKey = event => {
    if (!menuOpen) return;
    if (event.key === 'Escape') { event.stopPropagation(); onToggleMenu(); }
    if (event.key !== 'Tab') return;
    const items = [...headerRef.current.querySelectorAll('nav a, nav button, .nav-toggle')];
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const goTo = (target) => (e) => {
    e.preventDefault();
    onNavigate(target);
  };

  return (
    <div
      id="header"
      ref={headerRef}
      onKeyDown={handleKey}
      className={`site-header visible${isLight ? ' header-light' : ''}${menuOpen ? ' menu-open' : ''}`}
    >
      <a
        href="#top"
        onClick={goTo(0)}
        className="site-logo"
        aria-label="Dollar Creative Lab"
      >
        <span className="logo-main">DOLLAR</span>
        <span className="logo-sub">CREATIVE LAB</span>
      </a>

      <nav id="siteNav" className={menuOpen ? 'open' : ''} aria-label="Primary navigation">
        <a href="#about" id="navAboutLink" onClick={goTo('about')}>ABOUT</a>
        <a href="#showreel" id="navShowreelLink" onClick={goTo('showreel')}>SHOWREEL</a>
        <a href="#archive" id="navArchiveLink" onClick={goTo('work')}>WORK</a>
        <a href="#services" id="navServicesLink" onClick={goTo('services')}>SERVICES</a>
        <a href="#contact" id="navContactLink" onClick={goTo('contact')}>CONTACT</a>
        <button type="button" onClick={onAdmin} className="nav-admin-link" title="Manage projects in this browser">MANAGE</button>
      </nav>

      <button
        type="button"
        className="nav-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="siteNav"
        onClick={onToggleMenu}
      >
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
      </button>
    </div>
  );
}
