import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parseVimeoUrl } from '../src/utils/vimeo.js';
const projects=JSON.parse(readFileSync(new URL('../src/data/vimeo-projects.json',import.meta.url),'utf8'));

test('all 27 public account videos have distinct stable Vimeo IDs',()=>{
 assert.equal(projects.length,27);assert.equal(new Set(projects.map(p=>p.vimeoId)).size,27);
});
test('all project playback and previews use the original account video',()=>{
 for(const p of projects){assert.equal(parseVimeoUrl(p.videoUrl)?.id,p.vimeoId);assert.equal(p.videoUrl,p.previewVisual);assert.equal(p.sourceProfile,'https://vimeo.com/dollarcreativelab');assert.ok(p.title.trim());}
});
test('each public film has a bundled original poster and source metadata',()=>{
 for(const p of projects){assert.ok(existsSync(new URL('../public'+p.poster,import.meta.url)));assert.ok(p.width>0&&p.height>0&&p.duration>0);assert.equal(p.year,p.uploadedAt.slice(0,4));assert.equal(typeof p.description,'string');}
});
test('the selected curated brand showcase is present with its real description',()=>{
 const reel=projects.find(p=>p.vimeoId==='1237014270');assert.ok(reel.title.includes('SELECTED BRAND WORK'));assert.ok(reel.description.includes('curated showcase'));assert.equal(reel.duration,37);
});
test('same-title edits and trailers remain separate works',()=>{
 const resort=projects.filter(p=>p.title==='VINESIA resort AD.');assert.equal(resort.length,2);assert.notEqual(resort[0].vimeoId,resort[1].vimeoId);assert.ok(projects.some(p=>p.title==='SHAYATIN TRAILER'));
});
