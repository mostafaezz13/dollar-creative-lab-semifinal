import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaStartTime } from '../src/utils/mediaPlayback.js';

test('each preview begins at its own midpoint while main films default to the start', () => {
  assert.equal(mediaStartTime(43, .5), 21.5);
  assert.equal(mediaStartTime(137, .5), 68.5);
  assert.equal(mediaStartTime(6, .5), 3);
  assert.equal(mediaStartTime(43), 0);
});
test('live and unavailable durations do not produce an invalid seek', () => {
  for (const duration of [NaN, Infinity, undefined, 0, -1]) assert.equal(mediaStartTime(duration, .5), 0);
});
test('invalid offsets cannot seek past the end of the film', () => {
  assert.equal(mediaStartTime(100, -2), 0);
  assert.equal(mediaStartTime(100, 1), 99);
  assert.equal(mediaStartTime(100, 3), 99);
  assert.equal(mediaStartTime(100, NaN), 0);
});
