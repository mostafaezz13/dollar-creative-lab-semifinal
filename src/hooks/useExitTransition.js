import { useCallback, useEffect, useRef } from 'react';
import useReducedMotion from './useReducedMotion.js';

// Keep old content mounted long enough to leave before applying a state change.
export default function useExitTransition(ref, selector) {
  const reduced = useReducedMotion();
  const current = useRef({version:0,animations:[],mounted:true});
  useEffect(()=>{
    current.current.mounted=true;
    return ()=>{current.current.mounted=false;current.current.version++;current.current.animations.forEach(a=>a.cancel());};
  },[]);
  return useCallback(async change=>{
    const state=current.current;
    const version=++state.version;
    state.animations.forEach(animation=>animation.cancel());
    if(reduced){change();return;}
    const elements=[...(ref.current?.querySelectorAll(selector)||[])].filter(element=>{
      const rect=element.getBoundingClientRect();return rect.bottom>0&&rect.top<innerHeight;
    });
    const animations=elements.map((element,index)=>element.animate([
      {opacity:getComputedStyle(element).opacity,translate:getComputedStyle(element).translate},
      {opacity:0,translate:'0 -14px'}
    ],{duration:180,delay:Math.min(index,4)*16,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}));
    state.animations=animations;
    await Promise.allSettled(animations.map(animation=>animation.finished));
    if(state.mounted&&state.version===version) change();
    animations.forEach(animation=>animation.cancel());
    if(state.version===version)state.animations=[];
  },[ref,selector,reduced]);
}
