import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Player from '@vimeo/player';
import { mediaUrl } from '../utils/content.js';
import { parseVimeoUrl, vimeoEmbedUrl, isVimeoHost } from '../utils/vimeo.js';

// One lifecycle for native files and Vimeo: play, pause and cleanup are shared by the site.
const FilmPlayer = forwardRef(function FilmPlayer({ source, title = 'Film', poster = '', autoplay = false, active = true, muted = false, loop = false, controls = true, background = false, preload = 'metadata', className = '', id, onPlay, onPause, onError, onReady }, ref) {
  const nativeRef = useRef(null);
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const wantsPlay = useRef(false);
  const playback = useRef({});
  playback.current = { autoplay, active };
  const callbacks = useRef({});
  callbacks.current = { onPlay, onPause, onError, onReady };
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
    setMuted: async value => {
      if (apiRef.current) await apiRef.current.setMuted(value);
      else if (nativeRef.current) nativeRef.current.muted = value;
    }
  }), []);

  useEffect(() => {
    if (!renderEmbed || !hostRef.current) return;
    const host = hostRef.current;
    let disposed = false;
    const iframe = document.createElement('iframe');
    iframe.src = embed;
    iframe.title = title;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder','0');
    iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
    host.appendChild(iframe);
    const player = new Player(iframe);
    apiRef.current = player;
    player.on('play', () => { if (!disposed) callbacks.current.onPlay?.(); });
    player.on('pause', () => { if (!disposed) callbacks.current.onPause?.(); });
    player.on('error', error => { if (!disposed) callbacks.current.onError?.(error); });
    player.ready().then(() => {
      if (disposed) return;
      callbacks.current.onReady?.();
      if (wantsPlay.current || (playback.current.autoplay && playback.current.active)) player.play().catch(() => {});
    }).catch(error => { if (!disposed) callbacks.current.onError?.(error); });
    return () => {
      disposed = true;
      if (apiRef.current === player) apiRef.current = null;
      player.destroy().catch(() => {});
      iframe.remove();
    };
  }, [embed, renderEmbed]);

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
    return <div id={id} ref={hostRef} className={`film-player film-vimeo ${className}`} />;
  }
  return <video id={id} ref={nativeRef} className={`film-player film-native ${className}`} src={background && !active ? undefined : mediaUrl(source)} poster={mediaUrl(poster)} playsInline muted={muted} loop={loop} controls={controls} preload={background && !active ? 'none' : preload} onPlay={onPlay} onPause={onPause} onLoadedData={onReady} onError={() => onError?.(new Error('The video could not load.'))} />;
});
export default FilmPlayer;
