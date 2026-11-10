import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVimeoUrl, vimeoEmbedUrl } from '../src/utils/vimeo.js';

test('accepts regular video links and normalizes optional schemes', () => {
  assert.deepEqual(parseVimeoUrl('https://vimeo.com/123456789'), { id:'123456789', hash:'' });
  assert.deepEqual(parseVimeoUrl('vimeo.com/123456789'), { id:'123456789', hash:'' });
});
test('retains the privacy hash on both unlisted share and player links', () => {
  assert.deepEqual(parseVimeoUrl('https://vimeo.com/123456789/aB12345678'), { id:'123456789', hash:'aB12345678' });
  assert.deepEqual(parseVimeoUrl('https://player.vimeo.com/video/123456789?h=aB12345678'), { id:'123456789', hash:'aB12345678' });
});
test('identifies the actual video rather than a showcase/group id', () => {
  assert.equal(parseVimeoUrl('https://vimeo.com/showcase/5678/video/123456789').id,'123456789');
  assert.equal(parseVimeoUrl('https://vimeo.com/groups/demo/videos/123456789').id,'123456789');
  assert.equal(parseVimeoUrl('https://vimeo.com/channels/staffpicks/123456789').id,'123456789');
});
test('rejects deceptive hosts, arbitrary embeds, non-video pages and unsafe schemes', () => {
  for (const value of ['https://vimeo.com.attacker.test/123456789','https://attacker.test/video/123','javascript:alert(1)','<iframe src="https://vimeo.com/1"></iframe>','https://vimeo.com/showcase/1234','https://vimeo.com/settings','https://user:secret@vimeo.com/123456789']) assert.equal(parseVimeoUrl(value),null,value);
});
test('constructs only trusted embeds and keeps private link credentials intact', () => {
  const url = new URL(vimeoEmbedUrl('https://vimeo.com/123456789/aB12345678?autoplay=1'));
  assert.equal(url.origin,'https://player.vimeo.com');
  assert.equal(url.searchParams.get('h'),'aB12345678');
  assert.equal(url.searchParams.get('autoplay'),'0');
  assert.equal(url.searchParams.get('controls'),'1');
});
test('background previews are muted and looping when requested', () => {
  const url = new URL(vimeoEmbedUrl('https://vimeo.com/123456789',{background:true,muted:true,loop:true,controls:false}));
  for (const key of ['background','muted','loop','autoplay']) assert.equal(url.searchParams.get(key),'1');
  assert.equal(url.searchParams.get('controls'),'0');
});
