// A narrow desktop window is constrained too. Keep iPhone/iPad constrained in
// landscape and when iPadOS identifies itself as a Mac.
export function needsMobilePerformance({ width, userAgent = '', platform = '', maxTouchPoints = 0, coarsePointer = false }) {
  return width <= 768 || /iPhone|iPad|iPod|Android/i.test(userAgent)
    || (platform === 'MacIntel' && maxTouchPoints > 1) || coarsePointer;
}

export function nearestTunnelPreview(cards, cameraZ, maxZ, zStretch = 1) {
  if (!Number.isFinite(cameraZ) || cameraZ < 0 || cameraZ >= maxZ - 200) return -1;
  let selected = -1, distance = Infinity;
  cards.forEach((card,index) => {
    const relative = card.z * zStretch + cameraZ;
    if (relative < -1800 || relative > 1250) return;
    const next = Math.abs(relative - 300);
    if (next < distance) { selected = index; distance = next; }
  });
  return selected;
}
