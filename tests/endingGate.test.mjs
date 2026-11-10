import test from 'node:test';
import assert from 'node:assert/strict';
import { createEndingGate, advanceEndingGate } from '../src/utils/endingGate.js';
const bounds = { start: 9550, hold: 9650, contentStart: 10650, total: 25000 };
const step = (gate, values) => advanceEndingGate(gate, { ...bounds, now: 1000, current: 9400, target: 9400, delta: 400, gesture: 'wheel-1', ...values });
test('a large incoming scroll lands on the ending instead of skipping it', () => {
  const gate = createEndingGate();
  assert.equal(step(gate, { delta: 9000 }), bounds.hold);
  assert.equal(gate.holding, true);
});
test('the same gesture and its inertial tail keep the ending visible', () => {
  const gate = createEndingGate(); step(gate, {});
  for (const now of [1100, 1400, 2200, 4000]) {
    assert.equal(step(gate, { now, current: 9650, target: 9650, delta: 1000 }), bounds.hold);
  }
});
test('a second deliberate gesture exits after the entrance is visible', () => {
  const gate = createEndingGate(); step(gate, {});
  assert.equal(step(gate, { now: 1600, current: 9650, target: 9650, gesture: 'wheel-2' }), bounds.contentStart + 40);
  assert.equal(step(gate, { now: 1700, current: 10690, target: 10690, delta: 100, gesture: 'wheel-2' }), 10790);
});
test('reversing to the cards rearms the ending', () => {
  const gate = createEndingGate(); step(gate, {});
  assert.equal(step(gate, { current: 9650, target: 9650, delta: -500 }), 9150);
  assert.equal(gate.holding, false);
  assert.equal(step(gate, { current: 9150, target: 9150, delta: 600, gesture: 'wheel-2' }), bounds.hold);
});
test('a single touch swipe and its momentum cannot skip the ending', () => {
  const gate = createEndingGate(); step(gate, { gesture: 'touch-1' });
  assert.equal(step(gate, { gesture: 'touch-1', current: 9650, target: 9650, now: 2000, delta: 6000 }), bounds.hold);
  assert.equal(step(gate, { gesture: 'touch-2', current: 9650, target: 9650, now: 2500 }), bounds.contentStart + 40);
});
