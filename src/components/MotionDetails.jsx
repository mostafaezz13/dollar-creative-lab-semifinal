import React, { useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function MotionDetails({ children, ...props }) {
  const ref=useRef(null);
  const reduced=useReducedMotion();
  useEffect(()=>{
    const element=ref.current;
    let animation;
    const close=event=>{
      if(reduced||!element.open||event.target.closest('summary')!==element.querySelector('summary'))return;
      event.preventDefault();
      if(animation)return;
      const body=element.querySelector('.project-credits-body');
      if(!body){element.open=false;return;}
      const previous=body.style.overflow;
      body.style.overflow='hidden';
      animation=body.animate([{height:`${body.getBoundingClientRect().height}px`,opacity:1},{height:'0px',opacity:0}],{duration:200,easing:'ease-in',fill:'forwards'});
      animation.onfinish=()=>{element.open=false;animation.cancel();animation=null;body.style.overflow=previous;};
    };
    element.addEventListener('click',close);
    return()=>{element.removeEventListener('click',close);animation?.cancel();};
  },[reduced]);
  return <details ref={ref} {...props}>{children}</details>;
}
