import React, { useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

// One transparent canvas for the whole site. Native controls keep their own
// layout, semantics and click handlers; only the decorative material moves.
const TARGETS = 'button:not(.card-hit-target):not(.project-picture-surface):not(.reel-scroll-surface), .site-header nav a, .contact-project-link, .cult-social-link';
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
export default function VenomInteractions() {
  const canvas = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const surface = canvas.current;
    const ctx = surface.getContext('2d');
    const root = document.getElementById('studioApp');
    if (!ctx || !root) return;
    const controls = new Set();
    let active = null, retiring = null, frame = 0, amount = 0, previous = 0, pressed = false, dpr = 1;
    let pointer = { x: -1000, y: -1000 }, tip = { x: 0, y: 0 };
    const enhance = node => {
      if (!(node instanceof Element)) return;
      const candidates = [...(node.matches(TARGETS) ? [node] : []), ...node.querySelectorAll(TARGETS)];
      candidates.forEach(element => {
        if (controls.has(element) && element.classList.contains('venom-control')) return;
        element.classList.add('venom-control');
        if (getComputedStyle(element).position === 'static') element.classList.add('venom-relative');
        if (element.matches('.player-icon-button,.nav-toggle,.project-close')) element.classList.add('venom-compact');
        controls.add(element);
      });
    };
    enhance(root);
    const observer = new MutationObserver(records => records.forEach(record => {
      if (record.type === 'attributes') {
        if (record.target.matches(TARGETS) && !record.target.classList.contains('venom-control')) enhance(record.target);
      } else record.addedNodes.forEach(enhance);
    }));
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    const clear = () => ctx.clearRect(0, 0, innerWidth, innerHeight);
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(innerWidth*dpr); surface.height = Math.round(innerHeight*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const eligible = element => element.isConnected && !element.disabled && !element.closest('[inert],[aria-hidden="true"]');
    const nearest = () => {
      let chosen = null, distance = 72;
      for (const element of controls) {
        if (!element.isConnected) { controls.delete(element); continue; }
        if (!eligible(element)) continue;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom<0 || rect.top>innerHeight || rect.right<0 || rect.left>innerWidth) continue;
        const x = clamp(pointer.x,rect.left,rect.right), y = clamp(pointer.y,rect.top,rect.bottom);
        const dist = Math.hypot(pointer.x-x,pointer.y-y);
        if (dist >= distance) continue;
        // Never reach through another section, dialog or overlay.
        const hit = document.elementFromPoint(clamp(x,rect.left+1,rect.right-1),clamp(y,rect.top+1,rect.bottom-1));
        if (!hit || !element.contains(hit)) continue;
        chosen = element; distance = dist;
      }
      return chosen;
    };
    const setActive = next => {
      if (next === active) return;
      if (!next) retiring = active;
      else retiring = null;
      active?.classList.remove('venom-near','venom-pressed');
      active = next;
      active?.classList.add('venom-near');
      if (active) { const r=active.getBoundingClientRect(); tip={x:r.left+r.width/2,y:r.top+r.height/2}; }
    };
    const strand = (ax,ay,bx,by,width,phase,now,light) => {
      const dx=bx-ax,dy=by-ay,length=Math.max(1,Math.hypot(dx,dy)),nx=-dy/length,ny=dx/length;
      const points=[];
      for (let i=0;i<=28;i++) {
        const t=i/28, wave=Math.sin(t*Math.PI)*Math.sin(t*6+now*.003+phase)*Math.min(13,length*.12);
        points.push({x:ax+dx*t+nx*wave,y:ay+dy*t+ny*wave,w:width*Math.pow(1-t,1.4)+2.1});
      }
      const gradient=ctx.createLinearGradient(ax-12,ay-12,bx+10,by+10);
      if(light) { gradient.addColorStop(0,'#171d18');gradient.addColorStop(.28,'#66705e');gradient.addColorStop(.46,'#111612');gradient.addColorStop(.65,'#727c6b');gradient.addColorStop(1,'#20271f'); }
      else { gradient.addColorStop(0,'#404a3b');gradient.addColorStop(.23,'#edf2db');gradient.addColorStop(.37,'#606d59');gradient.addColorStop(.55,'#171f17');gradient.addColorStop(.8,'#c9e0a8');gradient.addColorStop(1,'#6f805e'); }
      ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(p.x+nx*p.w,p.y+ny*p.w):ctx.moveTo(p.x+nx*p.w,p.y+ny*p.w));
      for(let i=points.length-1;i>=0;i--) { const p=points[i];ctx.lineTo(p.x-nx*p.w,p.y-ny*p.w); }
      ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
      ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x+nx*p.w*.55,p.y+ny*p.w*.55):ctx.moveTo(p.x+nx*p.w*.55,p.y+ny*p.w*.55));
      ctx.strokeStyle=light?'#9caa8b99':'#f1ffdd99';ctx.lineWidth=.7;ctx.stroke();
      ctx.beginPath();ctx.arc(bx,by,3.5,0,Math.PI*2);ctx.fillStyle=gradient;ctx.fill();
    };
    const draw = now => {
      frame=0;
      const dt=Math.min(40,now-(previous||now-16));previous=now;
      clear();
      const target=active && eligible(active) && document.visibilityState==='visible' ? 1 : 0;
      amount+=(target-amount)*(1-Math.exp(-dt/(target?90:110)));
      const element = active || retiring;
      if (element && eligible(element) && amount>.005) {
        const r=element.getBoundingClientRect(), compact=element.classList.contains('venom-compact');
        const cx=r.left+r.width/2,cy=r.top+r.height/2;
        let ax=clamp(pointer.x,r.left+Math.min(16,r.width/3),r.right-Math.min(16,r.width/3)),ay=clamp(pointer.y,r.top+5,r.bottom-5);
        const edges=[{d:Math.abs(pointer.y-r.top),x:ax,y:r.top},{d:Math.abs(pointer.x-r.right),x:r.right,y:ay},{d:Math.abs(pointer.y-r.bottom),x:ax,y:r.bottom},{d:Math.abs(pointer.x-r.left),x:r.left,y:ay}];
        edges.sort((a,b)=>a.d-b.d);ax=edges[0].x;ay=edges[0].y;
        let dx=pointer.x-ax,dy=pointer.y-ay;
        if(pointer.x>=r.left&&pointer.x<=r.right&&pointer.y>=r.top&&pointer.y<=r.bottom) {
          dx=ax-cx;dy=ay-cy;const length=Math.hypot(dx,dy)||1;dx=dx/length*(compact?10:24);dy=dy/length*(compact?10:24);
        }
        const reach=Math.hypot(dx,dy)||1,limit=compact?34:90;
        const tx=ax+dx*Math.min(1,limit/reach),ty=ay+dy*Math.min(1,limit/reach);
        const ease=1-Math.exp(-dt/65);tip.x+=(tx-tip.x)*ease;tip.y+=(ty-tip.y)*ease;
        const style=getComputedStyle(element), light=Boolean(element.closest('#archiveSection'))||style.color==='rgb(0, 0, 0)';
        ctx.save();ctx.globalAlpha=amount*(pressed ? .8 : 1);
        // Keep all liquid outside the hit target so text and icons stay crisp.
        ctx.beginPath();ctx.rect(0,0,innerWidth,innerHeight);ctx.roundRect(r.left-.5,r.top-.5,r.width+1,r.height+1,Math.min(parseFloat(style.borderRadius)||3,r.height/2));ctx.clip('evenodd');
        const count=compact?1:3;
        for(let i=0;i<count;i++) { const spread=(i-(count-1)/2)*(compact?3:9);strand(ax+spread,ay,ax+(tip.x-ax)*amount+spread*.2,ay+(tip.y-ay)*amount,(compact?3:6)*(pressed ? .7 : 1),i*2,now,light); }
        ctx.restore();
      }
      if(target || amount>.005) frame=requestAnimationFrame(draw); else { previous=0; retiring=null; }
    };
    const wake = () => { if(!frame && !reduced) frame=requestAnimationFrame(draw); };
    const move = event => {
      if(reduced || event.pointerType==='touch') return;
      pointer={x:event.clientX,y:event.clientY};
      setActive(nearest());wake();
    };
    const stop = () => { setActive(null);pressed=false;wake(); };
    const press = event => {
      const element=event.target.closest(TARGETS);
      if(!element || !eligible(element)) return;
      pressed=true;element.classList.add('venom-pressed');
    };
    const release = () => { pressed=false;controls.forEach(element=>element.classList.remove('venom-pressed'));wake(); };
    size();
    window.addEventListener('resize',size);window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerdown',press,{passive:true});window.addEventListener('pointerup',release,{passive:true});window.addEventListener('pointercancel',release,{passive:true});
    window.addEventListener('blur',stop);document.documentElement.addEventListener('pointerleave',stop);document.addEventListener('visibilitychange',stop);
    return () => {
      observer.disconnect();cancelAnimationFrame(frame);clear();
      controls.forEach(element=>element.classList.remove('venom-control','venom-relative','venom-compact','venom-near','venom-pressed'));
      window.removeEventListener('resize',size);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',press);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',stop);document.documentElement.removeEventListener('pointerleave',stop);document.removeEventListener('visibilitychange',stop);
    };
  }, [reduced]);
  return <canvas ref={canvas} className="venom-surface" aria-hidden="true"/>;
}
