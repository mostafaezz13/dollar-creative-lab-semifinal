import React, { useEffect, useRef, useState, useCallback } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

const DISCIPLINES = [
  { name: 'EDITING', heading: 'Find the rhythm.', detail: 'Every cut changes the story. Scrub through a sequence of frames and watch the picture break apart, then resolve.', instruction: 'SCRUB THE CUT', a: 'DECONSTRUCT', b: 'RESOLVE' },
  { name: 'COLOR', heading: 'From log look to final.', detail: 'Scroll to build contrast and color in a moving cinematic shot. The flat log look is a demonstration treatment, not original camera LOG.', instruction: 'SCROLL TO DEVELOP THE GRADE', a: 'LOG LOOK', b: 'FINAL GRADE' },
  { name: 'SOUND', heading: 'Feel every frequency.', detail: 'A six-second synthesized sonic study. Start the sound and watch the spectrum react to the audio in real time.', instruction: 'PLAY THE SONIC STUDY', a: '58 HZ', b: 'IMMERSIVE / STEREO' },
  { name: 'FINISHING', heading: 'Ready for every screen.', detail: 'Online finishing, safe areas and delivery formats. Explore how a finished frame is prepared for widescreen, square and vertical delivery.', instruction: 'EXPLORE THE DELIVERY FORMATS', a: 'CONFORM', b: 'DELIVERY READY' }
];
const FRAME_PATHS = ['/craft-frame-1.jpg', '/craft-frame-2.jpg', '/craft-frame-3.jpg', '/craft-frame-4.jpg', '/craft-frame-5.jpg'];

export default function CraftStudio({ scrollOffset = 0 }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const audioRef = useRef(null);
  const barsRef = useRef([]);
  const colorVideoRef = useRef(null);
  const finishingVideoRef = useRef(null);
  const colorStartRef = useRef(0);
  const [colorPlaying, setColorPlaying] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [format, setFormat] = useState('16:9');
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(.55);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [visible, setVisible] = useState(false);
  const item = DISCIPLINES[active];
  const stopSound = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      cancelAnimationFrame(audio.frame);
      clearTimeout(audio.timer);
      audio.context.close().catch(() => {});
      audioRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (active !== 3 || !visible) stopSound(); }, [active, visible, stopSound]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stopSound(); };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); stopSound(); };
  }, [stopSound]);
  useEffect(() => {
    if (!visible || reduced || active === 3) return;
    if (active === 1) {
      setProgress(Math.max(0, Math.min(1, (scrollOffset - colorStartRef.current) / 480)));
      return;
    }
    const rect = stageRef.current.getBoundingClientRect();
    const next = Math.max(0, Math.min(1, (window.innerHeight * .72 - rect.top) / (window.innerHeight * .6)));
    setProgress(next);
  }, [scrollOffset, visible, reduced]);

  useEffect(() => {
    [colorVideoRef.current, finishingVideoRef.current].forEach(video => {
      if (!video) return;
      if (visible && !reduced) video.play().catch(() => {}); else video.pause();
    });
  }, [active, visible, reduced]);
  const toggleColor = async () => {
    const video = colorVideoRef.current;
    if (!video) return;
    if (!video.paused) { video.pause(); return; }
    try { await video.play(); } catch { setVideoError('Playback could not start. Try again.'); }
  };

  const playSound = async () => {
    if (audioRef.current) { stopSound(); return; }
    let context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = .75;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(.12, context.currentTime + .3);
      gain.gain.setValueAtTime(.12, context.currentTime + 4.8);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + 6);
      gain.connect(analyser); analyser.connect(context.destination);
      [58, 116, 174, 293.66, 440].forEach((frequency, i) => {
        const oscillator = context.createOscillator();
        oscillator.type = i < 2 ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(frequency * .5, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, context.currentTime + 1.5 + i * .3);
        const voiceGain = context.createGain();
        voiceGain.gain.value = .38 / (i + 1);
        oscillator.connect(voiceGain); voiceGain.connect(gain);
        oscillator.start(); oscillator.stop(context.currentTime + 6);
      });
      const state = { context, frame: 0, timer: 0 };
      audioRef.current = state;
      await context.resume();
      if (audioRef.current !== state) return;
      setAudioError(''); setPlaying(true);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const animate = () => {
        analyser.getByteFrequencyData(data);
        barsRef.current.forEach((bar, i) => {
          const value = data[Math.min(data.length - 1, Math.floor(i * 1.6))] / 255;
          if (bar) bar.style.transform = `scaleY(${.06 + value * .94})`;
        });
        state.frame = requestAnimationFrame(animate);
      };
      if (!reduced) animate();
      state.timer = setTimeout(stopSound, 6100);
    } catch {
      context?.close().catch(() => {});
      audioRef.current = null;
      setAudioError('Audio could not start in this browser. Please try again.');
    }
  };
  const select = index => { colorStartRef.current = scrollOffset; setActive(index); setProgress(index === 1 ? 0 : .5); setAudioError(''); setVideoError(''); };
  const onTabKey = event => {
    let next;
    if (event.key === 'ArrowRight') next = (active + 1) % 4;
    if (event.key === 'ArrowLeft') next = (active + 3) % 4;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 3;
    if (next === undefined) return;
    event.preventDefault(); event.stopPropagation(); select(next);
    document.getElementById(`craft-tab-${next}`)?.focus();
  };

  return (
    <div id="craftStudio" ref={rootRef} className="craft-studio">
      <div className="craft-topline"><span>THE CRAFT / INTERACTIVE STUDIES</span><span>04 DISCIPLINES. ONE VISION.</span></div>
      <div className="craft-tabs" role="tablist" aria-label="Explore our disciplines" onKeyDown={onTabKey}>
        {DISCIPLINES.map((discipline, index) => <button key={discipline.name} id={`craft-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="craft-panel" tabIndex={active === index ? 0 : -1} onClick={() => select(index)}><small>0{index + 1}</small>{discipline.name}<span aria-hidden="true">↗</span></button>)}
      </div>
      <div id="craft-panel" role="tabpanel" aria-labelledby={`craft-tab-${active}`}>
        <div ref={stageRef} className={`craft-stage craft-${item.name.toLowerCase()}${visible ? ' is-visible' : ''}${reduced ? ' motion-reduced' : ''}`} style={{ '--craft-progress': progress, '--craft-percent': `${progress * 100}%` }}>
          <div className="craft-visual" key={active}>
            {active === 0 && <><div className="edit-strips" aria-hidden="true">{FRAME_PATHS.map((src, index) => <div key={src} style={{ '--strip-index': index, transform: `translate3d(${(1 - progress) * (index % 2 ? 90 : -90)}px, ${(1 - progress) * (index - 2) * 32}px, ${(1 - progress) * -index * 100}px) rotateY(${(1 - progress) * (index - 2) * 14}deg)` }}><img src={progress > .92 ? FRAME_PATHS[2] : src} alt="" style={{ objectPosition: `${index * 25}% center` }} /><span>0{index + 1}</span></div>)}</div><div className="edit-timecode" aria-hidden="true">00:00:{String(Math.floor(progress * 24)).padStart(2, '0')}:<span>{String(Math.floor(progress * 96) % 24).padStart(2, '0')}</span></div></>}
            {active === 1 && <>
              <video className="color-study-video" ref={colorVideoRef} src="/color-study.mp4" muted loop playsInline preload="metadata" onPlay={() => setColorPlaying(true)} onPause={() => setColorPlaying(false)} onError={() => setVideoError('The color study could not load.')} style={{ filter: `saturate(${.18 + progress * .82}) contrast(${.62 + progress * .38}) brightness(${1.16 - progress * .16})` }} />
              <div className="color-state-label"><span>{progress < .08 ? 'LOG LOOK' : progress > .92 ? 'FINAL GRADE' : 'DEVELOPING COLOR'}</span><strong>{Math.round(progress * 100)}%</strong></div>
              <button className="color-video-toggle" onClick={toggleColor} aria-label={colorPlaying ? 'Pause color study' : 'Play color study'}>{colorPlaying ? 'Ⅱ PAUSE' : '▶ PLAY'}</button>
              <div className="grade-progress-track" aria-hidden="true"><i style={{transform:`scaleX(${progress})`}}/></div>
            </>}
            {active === 2 && <div className="finishing-study">
              <div className="finishing-monitor" style={{ aspectRatio: format.replace(':','/'), transform: reduced ? 'none' : `rotateY(${(1-progress)*-9}deg) rotateX(${(1-progress)*5}deg)` }}>
                <video ref={finishingVideoRef} src="/color-study.mp4" muted loop playsInline autoPlay={visible && !reduced} preload="metadata" />
                <div className="delivery-safe-area" aria-hidden="true"><span>TITLE SAFE / 80%</span></div>
                <div className="delivery-crosshair" aria-hidden="true"/>
                <span className="delivery-readout">{format} / MASTER</span>
              </div>
              <div className="delivery-formats" role="group" aria-label="Delivery format">{['16:9','1:1','9:16'].map(ratio=><button key={ratio} onClick={()=>setFormat(ratio)} aria-pressed={format===ratio}>{ratio}</button>)}</div>
              <span className="finishing-caption">CONFORM / QUALITY CONTROL / DELIVERY</span>
            </div>}
            {active === 3 && <div className={`sonic-study${playing ? ' playing' : ''}`}><div className="sonic-ring" aria-hidden="true"/><div className="sonic-spectrum" aria-hidden="true">{Array.from({ length: 56 }, (_, i) => <i key={i} ref={el => barsRef.current[i] = el} style={{ transform: `scaleY(${.08 + Math.pow(Math.sin(i * .39), 2) * .28})` }} />)}</div><button className="sonic-play" aria-label={playing ? 'Stop sonic study' : 'Play sonic study'} aria-pressed={playing} onClick={playSound}>{playing ? 'Ⅱ' : '▶'}<span>{playing ? 'STOP SOUND' : 'PLAY SOUND'}</span></button><span className="sonic-caption">SYNTHESIZED STUDY / 06 SEC</span></div>}
          </div>
          <div className="craft-corner top-left" aria-hidden="true"/><div className="craft-corner bottom-right" aria-hidden="true"/>
          <span className="craft-stage-number" aria-hidden="true">0{active + 1}</span>
        </div>
        {active !== 3 && <div className="craft-scrubber"><span>{item.a}</span><input type="range" min="0" max="100" value={Math.round(progress * 100)} aria-label={item.instruction} onChange={event => { const next = Number(event.target.value) / 100; if (active === 1) colorStartRef.current = scrollOffset - next * 480; setProgress(next); }} /><span>{item.b}</span></div>}
        {active === 1 && <p className="footage-attribution">Demo excerpt: <a href="https://mango.blender.org/" target="_blank" rel="noreferrer">Tears of Steel</a> · © Blender Foundation / Ian Hubert · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a> · Log-look treatment added for this preview.</p>}
        {videoError && <p className="media-error" role="status">{videoError}</p>}
        <div className="craft-description"><div><span className="craft-instruction">{item.instruction} ↗</span><h3>{item.heading}</h3></div><p>{item.detail}</p></div>
        {audioError && <p role="status" className="media-error">{audioError}</p>}
      </div>
    </div>
  );
}
