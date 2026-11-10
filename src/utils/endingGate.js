export function createEndingGate() {
  return { holding: false, released: false, entryGesture: null, enteredAt: 0 };
}

// Scroll events from a wheel/trackpad burst or one touch swipe share a gesture id.
// Reaching the studio ending consumes that gesture, including its inertial tail.
export function advanceEndingGate(gate, { current, target, delta, gesture, now, start, hold, contentStart, total }) {
  const desired = Math.max(0, Math.min(total, target + delta));
  if (delta < 0) {
    if (desired < start) Object.assign(gate, createEndingGate());
    return desired;
  }
  if (delta === 0) return target;
  if (gate.holding) {
    if (gesture !== gate.entryGesture && current >= start && now - gate.enteredAt >= 350) {
      gate.holding = false;
      gate.released = true;
      return Math.min(total, contentStart + 40);
    }
    return hold;
  }
  if (!gate.released && current < contentStart && desired >= start) {
    gate.holding = true;
    gate.entryGesture = gesture;
    gate.enteredAt = now;
    return hold;
  }
  return desired;
}
