import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FilmPlayer from './FilmPlayer.jsx';
import { parseVimeoUrl } from '../utils/vimeo.js';
import { mediaUrl } from '../utils/content.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

const sourceFor = project => project?.videoUrl || project?.previewVisual || '';
const isFilm = source => Boolean(parseVimeoUrl(source)) || /^(data:video\/|blob:)/i.test(source) || /\.(mp4|webm|mov)(?:[?#]|$)/i.test(source);
// Preserve DOM order for cached iframes: moving an iframe can reload its document.
const remember = (list, project) => list.some(item=>item.id===project.id)
  ? list.map(item=>item.id===project.id?project:item)
  : [...list.slice(-2),project];

export default function WorkPreview({ project, projects }) {
  const host = useRef(null);
  const lastProject = useRef(null);
  const [pool,setPool] = useState([]);
  const [status,setStatus] = useState({});
  const [desktop,setDesktop] = useState(()=>innerWidth>768);
  const [inView,setInView] = useState(false);
  const reduced = useReducedMotion();
  if(project)lastProject.current=project;
  const selected=project||lastProject.current;
  const visible=Boolean(project&&desktop&&inView);
  const selectedStatus=status[selected?.id]||{};
  const isPlaying=Boolean(selectedStatus.ready&&selectedStatus.playing);
  const update=(id,patch)=>setStatus(previous=>({...previous,[id]:{...previous[id],...patch}}));

  useEffect(()=>{
    const resize=()=>setDesktop(innerWidth>768);
    addEventListener('resize',resize);
    return()=>removeEventListener('resize',resize);
  },[]);
  useEffect(()=>{
    const archive=document.getElementById('archiveSection');
    if(!archive)return;
    const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{rootMargin:'100px 0px'});
    observer.observe(archive);return()=>observer.disconnect();
  },[]);
  // Prepare two likely previews when Work arrives, with a strict three-player cap.
  useEffect(()=>{
    if(!desktop||!inView)return;
    setPool(previous=>{
      if(previous.length)return previous;
      return projects.filter(item=>isFilm(sourceFor(item))).slice(0,2);
    });
  },[desktop,inView,projects]);
  useLayoutEffect(()=>{
    if(!project||!desktop)return;
    setPool(previous=>remember(previous,project));
  },[project,desktop]);
  useEffect(()=>{
    const element=host.current;
    let frame=0;
    let target={x:innerWidth*.68,y:innerHeight*.5},current={...target};
    const place=()=>{
      current.x+=(target.x-current.x)*(reduced?1:.2);
      current.y+=(target.y-current.y)*(reduced?1:.2);
      const width=element.offsetWidth,height=element.offsetHeight;
      const x=Math.max(16,Math.min(innerWidth-width-16,current.x+24));
      const y=Math.max(92,Math.min(innerHeight-height-16,current.y-height*.5));
      element.style.transform=`translate3d(${x}px,${y}px,0)`;
      frame=0;
      if(Math.abs(target.x-current.x)+Math.abs(target.y-current.y)>.5)frame=requestAnimationFrame(place);
    };
    const move=event=>{
      if(event.pointerType==='touch')return;
      target={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(place);
    };
    place();addEventListener('pointermove',move,{passive:true});
    return()=>{cancelAnimationFrame(frame);removeEventListener('pointermove',move);};
  },[reduced]);

  return <div ref={host} id="cursorPreview" className={`cursor-preview work-hover-preview${visible?' visible':''}`} aria-hidden="true" data-preview-state={!visible?'hidden':selectedStatus.error?'error':isPlaying?'playing':'loading'}>
    <div className="work-preview-shell">
      {desktop&&pool.map(item=>{
        const source=sourceFor(item),active=visible&&selected?.id===item.id;
        return <div key={item.id} className={`work-preview-layer${selected?.id===item.id?' is-current':''}`} data-project-id={item.id}>
          {isFilm(source)?<FilmPlayer className="work-preview-video" source={source} title={`${item.title} — Work preview`} poster={item.poster} background muted loop controls={false} keepMounted autoplay={active} active={active} startFraction={.5}
            aspectRatio={item.width&&item.height?item.width/item.height:16/9}
            onReady={()=>update(item.id,{ready:true,error:false})} onPlay={()=>update(item.id,{playing:true})} onPause={()=>update(item.id,{playing:false})} onError={()=>update(item.id,{error:true,playing:false})}/>
          : source ? <img src={mediaUrl(source)} alt=""/> : <div className="work-preview-empty">DOLLAR / FILM</div>}
        </div>;
      })}
      <div className="work-preview-caption"><span>{selected?.title||'SELECTED WORK'}</span><small><i/>{selectedStatus.error?'PREVIEW UNAVAILABLE':isPlaying?'PLAYING / SOUND OFF':'LOADING FILM'}</small></div>
    </div>
  </div>;
}
