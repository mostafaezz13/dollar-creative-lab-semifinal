import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { X, Play, LoaderCircle, ChevronDown } from 'lucide-react';
import useDialog from '../hooks/useDialog.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import FilmPlayer from './FilmPlayer.jsx';
import ProjectControls from './ProjectControls.jsx';
import MotionDetails from './MotionDetails.jsx';
import { parseVimeoUrl } from '../utils/vimeo.js';
import { mediaUrl, safeCredits } from '../utils/content.js';

export default function VideoModal({ project, origin, onClose }) {
  const dialogRef = useRef(null);
  const stageRef = useRef(null);
  const viewerRef = useRef(null);
  const videoRef = useRef(null);
  const lastVolume = useRef(1);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(project.duration || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  const reduced = useReducedMotion();
  const requestClose = useCallback(() => {
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
    setClosing(true);
  }, []);
  useDialog(dialogRef, requestClose);

  const originTransform = () => {
    const stage = stageRef.current;
    if (!stage || !origin?.width || !origin?.height) return 'translateY(30px) scale(.97)';
    // Layout dimensions are independent of the opening/closing animation.
    const animations = stage.getAnimations();
    animations.forEach(animation => animation.cancel());
    const rect = stage.getBoundingClientRect();
    return `translate(${origin.left - rect.left}px, ${origin.top - rect.top}px) scale(${origin.width / rect.width}, ${origin.height / rect.height})`;
  };
  useLayoutEffect(() => {
    const animation = stageRef.current.animate([
      { transform: reduced ? 'none' : originTransform(), opacity: reduced ? 0 : 1, borderRadius: '8px' },
      { transform: 'none', opacity: 1, borderRadius: '2px' }
    ], { duration: reduced ? 1 : 850, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    animation.onfinish = () => setEntered(true);
    return () => animation.cancel();
  }, [origin, reduced]);
  useEffect(() => {
    if (!closing) return;
    videoRef.current?.pause();
    dialogRef.current.scrollTop = 0;
    const to = originTransform();
    const animation = stageRef.current.animate([
      { transform: 'none', opacity: 1 }, { transform: to, opacity: 0 }
    ], { duration: reduced ? 1 : 550, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    animation.onfinish = onClose;
    return () => animation.cancel();
  }, [closing, onClose, origin, reduced]);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  const handleReady = metadata => {
    setReady(true); setBuffering(false);
    if (Number.isFinite(metadata?.duration)) setDuration(metadata.duration);
    if (typeof metadata?.muted === 'boolean') setMuted(metadata.muted);
    if (Number.isFinite(metadata?.volume)) setVolume(metadata.volume);
  };
  const togglePlay = async () => {
    if (!ready || closing) return;
    setMessage('');
    try {
      if (playing) await videoRef.current.pause();
      else { if (ended) await videoRef.current.seekTo(0); setEnded(false); await videoRef.current.play(); }
    } catch { setMessage('Press play to try again.'); }
  };
  const seek = async seconds => {
    if (!ready || !Number.isFinite(seconds)) return;
    const next = Math.max(0,Math.min(duration,seconds));
    setTime(next); setEnded(false);
    try { await videoRef.current.seekTo(next); } catch { setMessage('Could not seek. Please try again.'); }
  };
  const toggleMute = async () => {
    try {
      if (muted || volume === 0) {
        if (volume === 0) await videoRef.current.setVolume(lastVolume.current || 1);
        await videoRef.current.setMuted(false);
      } else await videoRef.current.setMuted(true);
    } catch { setMessage('Sound could not be changed. Please try again.'); }
  };
  const changeVolume = async value => {
    if (value > 0) lastVolume.current = value;
    try { await videoRef.current.setVolume(value); await videoRef.current.setMuted(value === 0); }
    catch { setMessage('Use your device’s volume controls to adjust the sound.'); }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewerRef.current.requestFullscreen();
    } catch { setMessage('Fullscreen is unavailable in this browser.'); }
  };
  const handleKeys = event => {
    if (event.target.closest('button,input,a,summary')) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') { event.preventDefault(); togglePlay(); }
    if (key === 'm') { event.preventDefault(); toggleMute(); }
    if (key === 'arrowright') { event.preventDefault(); seek(time + 5); }
    if (key === 'arrowleft') { event.preventDefault(); seek(time - 5); }
  };
  const source = project.videoUrl || project.previewVisual;
  const vimeo = parseVimeoUrl(source);
  const title = (project.title || 'Untitled film').split('|')[0].replace(/\s*\(1\)?\s*\.mp4$|\.mp4$/i,'').trim();
  const artist = project.client && project.client !== 'Dollar Creative Lab' ? project.client : '';
  const tags = (project.role || project.category || '').split('/').map(tag=>tag.trim()).filter(Boolean);
  const ratio = project.width && project.height ? project.width / project.height : 16/9;
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots : [];

  return (
    <div id="vModal" ref={dialogRef} className={`open cinema-dialog project-dialog${entered ? ' entered' : ''}${closing ? ' returning' : ''}`} role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" tabIndex={-1} inert={closing ? '' : undefined} onKeyDown={handleKeys} onClick={event => { if (event.target === event.currentTarget) requestClose(); }}>
      <header className="project-header"><span>DOLLAR CREATIVE LAB <i>/ FILM</i></span><button id="closeProjectBtn" className="project-close" onClick={requestClose} aria-label="Close project">Close <X size={18} strokeWidth={1.4}/></button></header>
      <main className="project-content">
        <div className="project-viewer" ref={viewerRef}>
          <div className="project-cinema" ref={stageRef} style={{'--film-aspect':ratio}}>
            {source && !failed ? <>
              <FilmPlayer key={retry} ref={videoRef} source={source} title={project.title} controls={false} autoplay={entered && !closing} active={!closing} poster={project.poster}
                onReady={handleReady} onPlay={() => { setPlaying(true); setEnded(false); setBuffering(false); }} onPause={() => setPlaying(false)} onEnded={() => { setEnded(true); setPlaying(false); }}
                onTimeUpdate={({seconds,duration:total}) => { if(Number.isFinite(seconds)) setTime(seconds); if(Number.isFinite(total)) setDuration(total); }} onDurationChange={value => { if(Number.isFinite(value)) setDuration(value); }}
                onVolumeChange={data => { if(Number.isFinite(data.volume)) setVolume(data.volume); if(typeof data.muted==='boolean') setMuted(data.muted); }}
                onBufferStart={() => setBuffering(true)} onBufferEnd={() => setBuffering(false)} onError={() => { setFailed(true); setReady(false); setPlaying(false); }}/>
              <button className="project-picture-surface" aria-label={playing ? 'Pause film from picture' : 'Play film from picture'} disabled={!ready || closing} onClick={togglePlay}><span className={`picture-play-icon${!playing && ready ? ' is-visible' : ''}`} aria-hidden="true"><Play size={30} strokeWidth={1.2}/></span></button>
              {(!ready || (buffering && playing)) && <div className="project-loading" role="status"><LoaderCircle size={22}/><span>{ready ? 'Buffering' : 'Loading film'}</span></div>}
            </> : <div className="project-playback-error" role="status"><p>This film could not be loaded.</p><button onClick={() => { setFailed(false); setReady(false); setMessage(''); setRetry(retry+1); }}>Try again</button>{vimeo && <a href={`https://vimeo.com/${vimeo.id}${vimeo.hash ? `/${vimeo.hash}` : ''}`} target="_blank" rel="noreferrer">Watch on Vimeo ↗</a>}</div>}
          </div>
          <ProjectControls ready={ready && entered} playing={playing} ended={ended} currentTime={time} duration={duration} muted={muted} volume={volume} fullscreen={fullscreen} fullscreenSupported={Boolean(document.fullscreenEnabled)} disabled={closing || failed} onTogglePlay={togglePlay} onSeek={seek} onToggleMute={toggleMute} onVolume={changeVolume} onFullscreen={toggleFullscreen}/>
        </div>
        {message && <p className="project-player-message" role="status">{message}</p>}
        <section className="project-info"><div><span className="project-overline">{project.year || 'SELECTED WORK'}</span><h2 id="project-dialog-title" aria-label={project.title}>{title}</h2></div><div className="project-meta">{artist && <span>{artist}</span>}<span>{tags.join(' / ')}</span></div></section>
        {(project.credits || screenshots.length > 0) && <MotionDetails className="project-credits"><summary>About this project <ChevronDown size={16} strokeWidth={1.4}/></summary><div className="project-credits-body">{project.credits && <div dangerouslySetInnerHTML={{__html:safeCredits(project.credits)}}/>}{screenshots.length>0 && <div className="project-stills">{screenshots.map((src,i)=><img key={i} src={mediaUrl(src)} alt={`${project.title} — still ${i+1}`} loading="lazy"/>)}</div>}</div></MotionDetails>}
      </main>
    </div>
  );
}
