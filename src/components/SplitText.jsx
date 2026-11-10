import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function SplitText({
  children,
  className = '',
  style = {},
  tag: Tag = 'div',
  type = 'words', // 'words' | 'chars'
  inView = true,
  delay = 0,
  duration = 0.8,
  stagger = 0.035,
  yOffset = 35,
  rotateX = 25
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const elements = el.querySelectorAll('.split-unit-inner');
    if (!elements.length) return;

    if (reducedMotion) { gsap.set(elements, { y: 0, rotateX: 0, opacity: 1 }); return; }
    if (inView) {
      gsap.to(elements, {
        y: '0%',
        rotateX: 0,
        opacity: 1,
        duration: duration,
        stagger: stagger,
        delay: delay,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    } else {
      gsap.to(elements, {
        y: `${yOffset}%`,
        rotateX: rotateX,
        opacity: 0,
        duration: 0.4,
        overwrite: 'auto'
      });
    }
    return () => gsap.killTweensOf(elements);
  }, [inView, delay, duration, stagger, yOffset, rotateX, reducedMotion]);

  // Convert text string into split spans wrapped with overflow-hidden mask
  const renderSplit = () => {
    if (typeof children !== 'string') {
      return children;
    }

    if (type === 'chars') {
      return children.split('').map((char, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="inline-block overflow-hidden"
          style={{ verticalAlign: 'top', perspective: '600px' }}
        >
          <span
            className="split-unit-inner inline-block will-change-transform"
            style={{
              transform: `translateY(${yOffset}%) rotateX(${rotateX}deg)`,
              transformOrigin: 'bottom center',
              opacity: 0,
              display: 'inline-block'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ));
    }

    // Default: 'words'
    const words = children.split(' ');
    return words.map((word, index) => (
      <span
        key={index}
        className="inline-block overflow-hidden mr-[0.25em]"
        style={{ verticalAlign: 'top', perspective: '800px' }}
      >
        <span
          className="split-unit-inner inline-block will-change-transform"
          style={{
            transform: `translateY(${yOffset}%) rotateX(${rotateX}deg)`,
            transformOrigin: 'bottom center',
            opacity: 0,
            display: 'inline-block'
          }}
        >
          {word}
        </span>
      </span>
    ));
  };

  return (
    <Tag aria-label={typeof children === 'string' ? children : undefined} ref={containerRef} className={className} style={{ ...style, transformStyle: 'preserve-3d' }}>
      {renderSplit()}
    </Tag>
  );
}

