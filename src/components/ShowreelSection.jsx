import React, { useRef, useState, useEffect } from 'react';
import useReveal from '../hooks/useReveal.js';
import useScrollScene from '../hooks/useScrollScene.js';
import SplitText from './SplitText.jsx';
import FilmPlayer from './FilmPlayer.jsx';
import { SHOWREEL } from '../data/showreel.js';
import { parseVimeoUrl } from '../utils/vimeo.js';

export default function ShowreelSection({ onBack, onNext, scrollOffset = 0 }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const usesVimeo = Boolean(parseVimeoUrl(SHOWREEL.videoUrl));
  const [playError, setPlayError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const isInView = useReveal(containerRef, '.cult-eyebrow, .cult-showreel-meta');
  useScrollScene(containerRef, scrollOffset);
  useEffect(() => { if (!isInView) videoRef.current?.pause(); }, [isInView]);
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { await video.pause(); return; }
    try { setPlayError(''); await video.setMuted(false); await video.play(); }
    catch { setPlayError('Playback could not start. Try the video controls or retry.'); }
  };
  return (
    <section id="showreelSection" ref={containerRef} className="cult-section kinetic-reel" aria-label="Dollar Showreel">
      <div className="reel-backdrop" aria-hidden="true"><span>PLAY</span><i/><i/></div>
      <div id="showreelInner" className="cult-section-inner">
        <div className="cult-eyebrow">SOUND ON. WORLD OFF.</div>
        <div className="cult-showreel-header"><h2 className="cult-showreel-title"><SplitText type="words" inView={isInView}>{SHOWREEL.title}</SplitText></h2><div className="cult-showreel-meta">EDITING / COLOR / FINISHING / SOUND</div></div>
        <div className="reel-perspective"><div className="cult-showreel-player-box">
          <FilmPlayer id="cultShowreelVideo" ref={videoRef} className="cult-showreel-video" title={SHOWREEL.title} source={SHOWREEL.videoUrl} poster={SHOWREEL.poster} loop active={isInView} controls onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => setPlayError(usesVimeo ? 'The showreel could not load. Check its Vimeo sharing and embedding settings.' : 'The showreel could not load. Please try again.')} />
          <button id="showreelPlayBtn" className="reel-scroll-surface" aria-label={isPlaying ? 'Pause showreel' : 'Play showreel with sound'} aria-pressed={isPlaying} onClick={togglePlay}><span className="cult-showreel-play-toggle" aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span></button>
          <span className="reel-frame-label" aria-hidden="true">DOLLAR / MOTION PICTURE</span>
        </div></div>
        <p className="showreel-description">{SHOWREEL.description}</p>
        {playError && <p className="media-error" role="status">{playError}</p>}
        <div className="cult-showreel-footer"><button id="showreelBackBtn" className="archive-back-btn" onClick={onBack}>← BACK TO STUDIO</button><span className="reel-scroll-note">SCROLL TO CONTINUE ↓</span><button id="showreelToWorkBtn" className="cult-next-btn" onClick={onNext}>ENTER WORK ↗</button></div>
      </div>
    </section>
  );
}
