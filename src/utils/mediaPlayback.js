// Start a preview inside its real media duration; unknown/live durations start at zero.
export function mediaStartTime(duration, fraction = 0) {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(fraction)) return 0;
  return duration * Math.max(0, Math.min(fraction, .99));
}
