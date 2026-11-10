import React, { useState, useMemo, useRef } from 'react';
import useReveal from '../hooks/useReveal.js';
import useExitTransition from '../hooks/useExitTransition.js';
import SplitText from './SplitText.jsx';

export default function WorkSection({ projects, onProjectClick, onBack, onNext, onRowHover, scrollOffset = 0 }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeYear, setActiveYear] = useState('ALL');
  const sectionRef = useRef(null);
  const transition = useExitTransition(sectionRef, '.archive-row');
  const pendingFilters = useRef({category:'ALL',year:'ALL'});
  const changeFilters = patch => {
    onRowHover?.(null);
    const next={...pendingFilters.current,...patch};
    pendingFilters.current=next;
    transition(()=>{setActiveCategory(next.category);setActiveYear(next.year);});
  };

  // Legacy builds CAT/YEAR pills by splitting category on "/" only and
  // collecting years as strings (year list sorted descending numerically).
  const categories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category) {
        p.category.split('/').forEach((part) => {
          const t = part.trim().toUpperCase();
          if (t) set.add(t);
        });
      }
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [projects]);

  const years = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.year) set.add(p.year.toString().trim());
    });
    return ['ALL', ...Array.from(set).sort((a, b) => Number(b) - Number(a))];
  }, [projects]);

  // Legacy match: category uses indexOf on the uppercase string, year exact.
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat =
        activeCategory === 'ALL' ||
        (p.category && p.category.split('/').some(part => part.trim().toUpperCase() === activeCategory));
      const matchYear =
        activeYear === 'ALL' || (p.year && p.year.toString().trim() === activeYear);
      return matchCat && matchYear;
    });
  }, [projects, activeCategory, activeYear]);

  const inView = useReveal(sectionRef, '.archive-topbar, .archive-filter-col, .archive-row, .archive-footer', filteredProjects);

  return (
    <section
      id="archiveSection"
      ref={sectionRef}
      className="archive-section"
      aria-label="Project Archive"
      style={{ perspective: '1200px' }}
    >
      <div id="archiveInner" className="archive-inner">
        {/* Topbar */}
        <div className="archive-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="archive-topbar-title"><SplitText type="chars" inView={inView}>PROJECT ARCHIVE</SplitText></div>
          </div>
        </div>

        {/* Filter grid */}
        <div className="archive-filter-grid">
          <div className="archive-filter-col">
            <span className="filter-heading">CAT ↓</span>
            <div className="filter-pills" id="catFilterList">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn${cat === activeCategory ? ' active' : ''}`}
                  aria-pressed={cat === activeCategory}
                  onClick={() => { changeFilters({category:cat}); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="archive-filter-spacer" />

          <div className="archive-filter-col archive-filter-col-right">
            <span className="filter-heading">YEAR ↓</span>
            <div className="filter-pills filter-pills-right" id="yearFilterList">
              {years.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className={`filter-btn${yr === activeYear ? ' active' : ''}`}
                  aria-pressed={yr === activeYear}
                  onClick={() => { changeFilters({year:yr}); }}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="archive-list-wrap" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
          <div id="archiveProjectList" className="archive-project-list">
            {filteredProjects.map((p, index) => {
              const num = filteredProjects.length - index;
              const idxStr = num < 10 ? `0${num}` : `${num}`;
              return (
                <div
                  key={p.id || index}
                  className="archive-row group transition-colors duration-200"
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${p.client} — ${p.title}`}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onProjectClick(p, event.currentTarget); } }}
                  onClick={event => { onRowHover?.(null); onProjectClick(p, event.currentTarget); }}
                  onPointerEnter={event => { if(event.pointerType!=='touch') onRowHover?.(p); }}
                  onPointerLeave={() => onRowHover?.(null)}
                  onFocus={() => onRowHover?.(p)}
                  onBlur={() => onRowHover?.(null)}
                  style={{
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="row-idx">{idxStr}</div>
                  <div className="row-client">{p.client || '---'}</div>
                  <div className="row-title">{p.title || '---'}</div>
                  <div className="row-role">{p.role || p.category || '---'}</div>
                  <div className="row-year">{p.year || '----'}</div>
                </div>
              );
            })}
          </div>
          <div
            id="archiveEmptyState"
            role="status"
            className="archive-empty-state"
            style={{ display: filteredProjects.length === 0 ? 'block' : 'none' }}
          >
            No items found in filter
          </div>
        </div>

        {/* Footer */}
        <div className="archive-footer">
          <div className="archive-footer-copy">© DOLLAR CREATIVE LAB — POST PRODUCTION HOUSE</div>
        </div>
      </div>
    </section>
  );
}
