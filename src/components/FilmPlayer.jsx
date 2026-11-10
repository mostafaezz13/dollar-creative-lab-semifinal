import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Player from '@vimeo/player';
import { mediaUrl } from '../utils/content.js';
import { parseVimeoUrl, vimeoEmbedUrl, isVimeoHost } from '../utils/vimeo.js';

// One lifecycle for native files and Vimeo: play, pause and cleanup are shared by the site.
const FilmPlayer = forwardRef(function FilmPlayer({ source, title = 'Film', poster = '', autoplay = false, active = true, muted = false, loop = false, controls = true, background = false, preload = 'metadata', aspectRatio = 16/9, className = '', id, onPlay, onPause, onError, onReady, onTimeUpdate, onDurationChange, onVolumeChange, onEnded, onBufferStart, onBufferEnd }, ref) {
  const nativeRef = useRef(null);
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const wantsPlay = useRef(false);
  const playback = useRef({});
  playback.current = { autoplay, active };
  const callbacks = useRef({});
  callbacks.current = { onPlay, onPause, onError, onReady, onTimeUpdate, onDurationChange, onVolumeChange, onEnded, onBufferStart, onBufferEnd };
  const vimeo = parseVimeoUrl(source);
  const embed = vimeoEmbedUrl(source, { muted, loop, controls, background });
  const renderEmbed = Boolean(vimeo) && (!background || active);
  const unavailable = !source || (isVimeoHost(source) && !vimeo);

  useImperativeHandle(ref, () => ({
    play: async () => {
      wantsPlay.current = true;
      if (apiRef.current) return apiRef.current.play();
      if (nativeRef.current) return nativeRef.current.play();
    },
    pause: async () => {
      wantsPlay.current = false;
      if (apiRef.current) await apiRef.current.pause().catch(() => {});
      else nativeRef.current?.pause();
    },
    seekTo: async seconds => {
      if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Invalid seek time');
      if (apiRef.current) return apiRef.current.setCurrentTime(seconds);
      if (!nativeRef.current || nativeRef.current.readyState < 1) throw new Error('Player is not ready');
      nativeRef.current.currentTime = seconds;
      return seconds;
    },
    setVolume: async volume => {
      if (!Number.isFinite(volume) || volume < 0 || volume > 1) throw new RangeError('Invalid volume');
      if (apiRef.current) return apiRef.current.setVolume(volume);
      if (nativeRef.current) nativeRef.current.volume = volume;
      return volume;
    },
    setMuted: async value => {
      if (apiRef.current) await apiRef.current.setMuted(value);
      else if (nativeRef.current) nativeRef.current.muted = value;
    }
  }), []);

  useEffect(() => {
    if (!renderEmbed || !hostRef.current) return;
    const host = hostRef.current;
    host.dataset.ready = 'false';
    let disposed = false;
    const iframe = document.createElement('iframe');
    iframe.src = embed;
    iframe.title = title;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder','0');
    if (!controls) { iframe.tabIndex = -1; iframe.setAttribute('aria-hidden','true'); }
    iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
    host.appendChild(iframe);
    const resize = () => {
      if (!background || !(aspectRatio > 0)) return;
      const width = Math.max(host.clientWidth, host.clientHeight * aspectRatio);
      const height = width / aspectRatio;
      Object.assign(iframe.style, { inset: 'auto', left: '50%', top: '50%', width: `${width}px`, height: `${height}px`, transform: 'translate(-50%,-50%)' });
    };
    const observer = background ? new ResizeObserver(resize) : null;
    observer?.observe(host); resize();
    const player = new Player(iframe);
    apiRef.current = player;
    player.on('play', () => { if (!disposed) callbacks.current.onPlay?.(); });
    player.on('pause', () => { if (!disposed) callbacks.current.onPause?.(); });
    player.on('timeupdate', data => { if (!disposed) callbacks.current.onTimeUpdate?.(data); });
    player.on('durationchange', data => { if (!disposed) callbacks.current.onDurationChange?.(data.duration); });
    player.on('volumechange', data => { if (!disposed) callbacks.current.onVolumeChange?.(data); });
    player.on('ended', () => { if (!disposed) callbacks.current.onEnded?.(); });
    player.on('bufferstart', () => { if (!disposed) callbacks.current.onBufferStart?.(); });
    player.on('bufferend', () => { if (!disposed) callbacks.current.onBufferEnd?.(); });
    player.on('error', error => { if (!disposed) callbacks.current.onError?.(error); });
    player.ready().then(() => {
      if (disposed) return;
      host.dataset.ready = 'true';
      Promise.all([player.getDuration(), player.getMuted(), player.getVolume()]).then(([duration, isMuted, volume]) => {
        if (!disposed) callbacks.current.onReady?.({ duration, muted: isMuted, volume });
      }).catch(() => { if (!disposed) callbacks.current.onReady?.({}); });
      if (wantsPlay.current || (playback.current.autoplay && playback.current.active)) player.play().catch(() => {});
    }).catch(error => { if (!disposed) callbacks.current.onError?.(error); });
    return () => {
      disposed = true;
      observer?.disconnect();
      if (apiRef.current === player) apiRef.current = null;
      player.destroy().catch(() => {});
      iframe.remove();
    };
  }, [embed, renderEmbed, aspectRatio]);

  useEffect(() => {
    if (!active) {
      wantsPlay.current = false;
      apiRef.current?.pause().catch(() => {});
      nativeRef.current?.pause();
    } else if (autoplay) {
      wantsPlay.current = true;
      const promise = apiRef.current ? apiRef.current.play() : nativeRef.current?.play();
      promise?.catch(() => {});
    }
  }, [source, active, autoplay]);

  if (unavailable) return <div className={`film-player film-placeholder ${className}`} role="status">Film unavailable</div>;
  if (vimeo) {
    if (background && !active) return poster ? <img className={`film-player film-poster ${className}`} src={mediaUrl(poster)} alt="" /> : <div className={`film-player film-placeholder ${className}`} aria-hidden="true" />;
    return <div id={id} ref={hostRef} className={`film-player film-vimeo ${className}`} style={poster ? { backgroundImage: `url(${JSON.stringify(mediaUrl(poster))})` } : undefined} />;
  }
  return <video id={id} ref={nativeRef} className={`film-player film-native ${className}`} src={background && !active ? undefined : mediaUrl(source)} poster={mediaUrl(poster)} playsInline muted={muted} loop={loop} controls={controls} preload={background && !active ? 'none' : preload}
    onPlay={onPlay} onPause={onPause}
    onLoadedMetadata={event => onReady?.({ duration: event.currentTarget.duration, muted: event.currentTarget.muted, volume: event.currentTarget.volume })}
    onTimeUpdate={event => onTimeUpdate?.({ seconds: event.currentTarget.currentTime, duration: event.currentTarget.duration })}
    onDurationChange={event => onDurationChange?.(event.currentTarget.duration)}
    onVolumeChange={event => onVolumeChange?.({ volume: event.currentTarget.volume, muted: event.currentTarget.muted })}
    onEnded={onEnded} onWaiting={onBufferStart} onPlaying={onBufferEnd}
    onError={() => onError?.(new Error('The video could not load.'))} />;
});
export default FilmPlayer;
