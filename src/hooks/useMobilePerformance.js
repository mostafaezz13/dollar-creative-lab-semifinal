import { useEffect, useState } from 'react';
import { needsMobilePerformance } from '../utils/mobilePerformance.js';

function detect() {
  return needsMobilePerformance({
    width:innerWidth, userAgent:navigator.userAgent, platform:navigator.platform,
    maxTouchPoints:navigator.maxTouchPoints,
    coarsePointer:matchMedia('(pointer: coarse)').matches
  });
}
export default function useMobilePerformance() {
  const [mobile,setMobile]=useState(detect);
  useEffect(()=>{
    const pointer=matchMedia('(pointer: coarse)');
    const update=()=>setMobile(detect());
    addEventListener('resize',update);pointer.addEventListener('change',update);
    return()=>{removeEventListener('resize',update);pointer.removeEventListener('change',update);};
  },[]);
  return mobile;
}
