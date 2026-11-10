import React, { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

export function formatMediaTime(value) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const tail = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2,'0')}:${tail}` : `${minutes}:${tail}`;
}

export default function ProjectControls({ ready, playing, ended, currentTime, duration, muted, volume, fullscreen, fullscreenSupported, disabled, onTogglePlay, onSeek, onToggleMute, onVolume, onFullscreen }) {
  const dragging = useRef(false);
  const [draft, setDraft] = useState(null);
  const shown = draft ?? currentTime;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const percent = safeDuration ? Math.min(100, Math.max(0, shown / safeDuration * 100)) : 0;
  const silent = muted || volume === 0;
  const seek = event => {
    const value = Number(event.target.value);
    setDraft(value);
    if (!dragging.current) { onSeek(value); setDraft(null); }
  };
  const finishSeek = event => {
    if (!dragging.current) return;
    dragging.current = false;
    onSeek(Number(event.currentTarget.value)); setDraft(null);
  };
  const PlayIcon = ended ? RotateCcw : playing ? Pause : Play;
  return (
    <div className="project-controls" role="group" aria-label="Film playback controls">
      <button type="button" className="player-icon-button" aria-label={ended ? 'Replay film' : playing ? 'Pause film' : 'Play film'} title={ended ? 'Replay' : playing ? 'Pause' : 'Play'} disabled={!ready || disabled} onClick={onTogglePlay}><PlayIcon size={18} strokeWidth={1.5}/></button>
      <span className="player-time" aria-hidden="true">{formatMediaTime(shown)}</span>
      <input className="project-seek" type="range" min="0" max={safeDuration || 1} step="0.1" value={Math.min(shown,safeDuration || 1)} disabled={!ready || !safeDuration || disabled} aria-label="Seek film" aria-valuetext={`${formatMediaTime(shown)} of ${formatMediaTime(safeDuration)}`} style={{'--played-percent':`${percent}%`}}
        onPointerDown={() => { dragging.current = true; }} onPointerUp={finishSeek} onPointerCancel={() => { dragging.current = false; setDraft(null); }} onBlur={finishSeek} onChange={seek}/>
      <span className="player-time player-total" aria-hidden="true">{formatMediaTime(safeDuration)}</span>
      <button type="button" className="player-icon-button" aria-label={silent ? 'Unmute film' : 'Mute film'} aria-pressed={silent} title={silent ? 'Unmute' : 'Mute'} disabled={!ready || disabled} onClick={onToggleMute}>{silent ? <VolumeX size={18} strokeWidth={1.5}/> : <Volume2 size={18} strokeWidth={1.5}/>}</button>
      <input className="project-volume" type="range" min="0" max="1" step="0.05" value={silent ? 0 : volume} aria-label="Film volume" disabled={!ready || disabled} onChange={event => onVolume(Number(event.target.value))}/>
      {fullscreenSupported && <button type="button" className="player-icon-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} aria-pressed={fullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} disabled={disabled} onClick={onFullscreen}>{fullscreen ? <Minimize size={18} strokeWidth={1.5}/> : <Maximize size={18} strokeWidth={1.5}/>}</button>}
    </div>
  );
}
