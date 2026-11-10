import React, { useRef, useState, useEffect } from 'react';
import useReveal from '../hooks/useReveal.js';
import useScrollScene from '../hooks/useScrollScene.js';
import SplitText from './SplitText.jsx';
import FilmPlayer from './FilmPlayer.jsx';
import ProjectControls from './ProjectControls.jsx';
import { SHOWREEL } from '../data/showreel.js';

export default function ShowreelSection({
  onBack,
  onNext,
  scrollOffset = 0,
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const videoRef = useRef(null);
  const lastVolume = useRef(1);

  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [state, setState] = useState({
    ready: false,
    playing: false,
    ended: false,
    currentTime: 0,
    duration: SHOWREEL.duration || 0,
    muted: false,
    volume: 1,
  });

  const update = patch => {
    setState(previous => ({ ...previous, ...patch }));
  };

  const isInView = useReveal(
    containerRef,
    '.cult-eyebrow, .cult-showreel-meta',
  );

  useScrollScene(containerRef, scrollOffset);

  useEffect(() => {
    if (!isInView && !fullscreen) {
      videoRef.current?.pause();
    }
  }, [isInView, fullscreen]);

  useEffect(() => {
    const syncFullscreen = () => {
      setFullscreen(
        document.fullscreenElement === viewerRef.current,
      );
    };

    document.addEventListener('fullscreenchange', syncFullscreen);

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        syncFullscreen,
      );
    };
  }, []);

  const run = async action => {
    try {
      setError('');
      await action();
    } catch {
      setError('Could not complete this action. Please try again.');
    }
  };

  const togglePlay = () => {
    if (!state.ready) return;

    run(async () => {
      if (state.playing) {
        await videoRef.current.pause();
      } else {
        if (state.ended) {
          await videoRef.current.seekTo(0);
        }
        await videoRef.current.play();
      }
    });
  };

  const seek = seconds => {
    const next = Math.max(0, Math.min(state.duration, seconds));

    update({ currentTime: next, ended: false });
    run(() => videoRef.current.seekTo(next));
  };

  const toggleMute = () => run(async () => {
    const silent = state.muted || state.volume === 0;

    if (silent) {
      const restored = state.volume || lastVolume.current;

      await videoRef.current.setVolume(restored);
      await videoRef.current.setMuted(false);
      update({ muted: false, volume: restored });
    } else {
      await videoRef.current.setMuted(true);
      update({ muted: true });
    }
  });

  const changeVolume = value => run(async () => {
    if (value > 0) lastVolume.current = value;

    await videoRef.current.setVolume(value);
    await videoRef.current.setMuted(value === 0);
    update({ volume: value, muted: value === 0 });
  });

  const toggleFullscreen = () => run(async () => {
    if (document.fullscreenElement === viewerRef.current) {
      await document.exitFullscreen();
    } else {
      await viewerRef.current.requestFullscreen();
    }
  });

  const syncVolume = data => {
    const patch = {};

    if (Number.isFinite(data.volume)) patch.volume = data.volume;
    if (typeof data.muted === 'boolean') patch.muted = data.muted;

    update(patch);
  };

  return (
    <section
      id="showreelSection"
      ref={containerRef}
      className="cult-section kinetic-reel"
      aria-label="Dollar Showreel"
    >
      <div className="reel-backdrop" aria-hidden="true">
        <span>PLAY</span><i /><i />
      </div>

      <div id="showreelInner" className="cult-section-inner">
        <div className="cult-eyebrow">SOUND ON. WORLD OFF.</div>

        <div className="cult-showreel-header">
          <h2 className="cult-showreel-title">
            <SplitText type="words" inView={isInView}>
              {SHOWREEL.title}
            </SplitText>
          </h2>
          <div className="cult-showreel-meta">
            EDITING / COLOR / SOUND / FINISHING
          </div>
        </div>

        <div className="reel-perspective">
          <div className="showreel-custom-viewer" ref={viewerRef}>
            <div className="cult-showreel-player-box">
              <FilmPlayer
                id="cultShowreelVideo"
                ref={videoRef}
                className="cult-showreel-video"
                title={SHOWREEL.title}
                source={SHOWREEL.videoUrl}
                poster={SHOWREEL.poster}
                active={isInView || fullscreen}
                controls={false}
                loop
                onReady={metadata => {
                  update({
                    ready: true,
                    ...(Number.isFinite(metadata?.duration)
                      ? { duration: metadata.duration }
                      : {}),
                  });
                  if (metadata) syncVolume(metadata);
                }}
                onPlay={() => update({
                  playing: true,
                  ended: false,
                })}
                onPause={() => update({ playing: false })}
                onEnded={() => update({
                  playing: false,
                  ended: true,
                })}
                onTimeUpdate={({ seconds, duration }) => {
                  const patch = {};
                  if (Number.isFinite(seconds)) {
                    patch.currentTime = seconds;
                  }
                  if (Number.isFinite(duration)) {
                    patch.duration = duration;
                  }
                  update(patch);
                }}
                onDurationChange={duration => {
                  if (Number.isFinite(duration)) update({ duration });
                }}
                onVolumeChange={syncVolume}
                onError={() => {
                  update({ ready: false, playing: false });
                  setError('The showreel could not load. Please refresh.');
                }}
              />

              <button
                id="showreelPlayBtn"
                type="button"
                className="showreel-picture-button"
                aria-label={state.playing
                  ? 'Pause showreel'
                  : 'Play showreel'}
                aria-pressed={state.playing}
                disabled={!state.ready}
                onClick={togglePlay}
              >
                {!state.playing && state.ready && (
                  <span aria-hidden="true">▶</span>
                )}
              </button>

              {!state.ready && !error && (
                <span className="showreel-loading" role="status">
                  Loading film…
                </span>
              )}
            </div>

            <ProjectControls
              ready={state.ready}
              playing={state.playing}
              ended={state.ended}
              currentTime={state.currentTime}
              duration={state.duration}
              muted={state.muted}
              volume={state.volume}
              fullscreen={fullscreen}
              fullscreenSupported={Boolean(document.fullscreenEnabled)}
              disabled={!state.ready}
              onTogglePlay={togglePlay}
              onSeek={seek}
              onToggleMute={toggleMute}
              onVolume={changeVolume}
              onFullscreen={toggleFullscreen}
            />
          </div>
        </div>

        <p className="showreel-description">{SHOWREEL.description}</p>

        {error && <p className="media-error" role="status">{error}</p>}

        <div className="cult-showreel-footer">
          <span className="reel-scroll-note">SCROLL TO CONTINUE ↓</span>
        </div>
      </div>
    </section>
  );
}