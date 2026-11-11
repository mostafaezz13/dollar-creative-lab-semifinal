import test from 'node:test';
import assert from 'node:assert/strict';
import { needsMobilePerformance, nearestTunnelPreview } from '../src/utils/mobilePerformance.js';

const desktop={width:1440,userAgent:'Mozilla/5.0 Windows Chrome',platform:'Win32',maxTouchPoints:0,coarsePointer:false};
test('desktop keeps the full playback policy while narrow/touch devices are constrained',()=>{
  assert.equal(needsMobilePerformance(desktop),false);
  assert.equal(needsMobilePerformance({...desktop,width:390}),true);
  assert.equal(needsMobilePerformance({...desktop,width:768}),true);
  assert.equal(needsMobilePerformance({...desktop,coarsePointer:true,maxTouchPoints:5}),true);
});
test('iPhone and iPad retain the mobile budget in landscape and desktop-style iPadOS',()=>{
  assert.equal(needsMobilePerformance({...desktop,width:844,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X)'}),true);
  assert.equal(needsMobilePerformance({...desktop,width:1194,userAgent:'Mozilla/5.0 Macintosh',platform:'MacIntel',maxTouchPoints:5}),true);
  assert.equal(needsMobilePerformance({...desktop,platform:'MacIntel',maxTouchPoints:0}),false);
  assert.equal(needsMobilePerformance({...desktop,width:1024,userAgent:'Mozilla/5.0 Android'}),true);
});
const cards=[{z:-500},{z:-1500},{z:-2500}];
test('only the nearest eligible card is selected as the camera travels',()=>{
  assert.equal(nearestTunnelPreview(cards,0,5000,1.4),0);
  assert.equal(nearestTunnelPreview(cards,1000,5000,1.4),0);
  assert.equal(nearestTunnelPreview(cards,2000,5000,1.4),1);
  assert.equal(nearestTunnelPreview(cards,3200,5000,1.4),2);
});
test('the ending and empty/invalid scenes do not retain a preview decoder',()=>{
  assert.equal(nearestTunnelPreview(cards,4800,5000,1.4),-1);
  assert.equal(nearestTunnelPreview(cards,7000,5000,1.4),-1);
  assert.equal(nearestTunnelPreview(cards,-1,5000,1.4),-1);
  assert.equal(nearestTunnelPreview(cards,NaN,5000,1.4),-1);
  assert.equal(nearestTunnelPreview([],0,5000,1.4),-1);
  assert.equal(nearestTunnelPreview([{z:-9000}],0,11000,1.4),-1);
});
