// Parse only Vimeo's video URL shapes. Never accept arbitrary embed HTML/hosts.
export function parseVimeoUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  if (!/^(?:(?:https?:\/\/)?(?:www\.)?vimeo\.com\/|https?:\/\/player\.vimeo\.com\/)/i.test(text)) return null;
  let url;
  try {
    const source = text.replace(/^(?=(?:www\.)?vimeo\.com\/)/i, 'https://');
    url = new URL(source);
  } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (!['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) return null;
  const path = url.pathname.replace(/\/+$/, '');
  let match;
  if (host === 'player.vimeo.com') match = path.match(/^\/video\/([1-9]\d*)$/);
  else match = path.match(/^\/([1-9]\d*)(?:\/([a-zA-Z0-9]+))?$/)
    || path.match(/^\/channels\/[^/]+\/([1-9]\d*)$/)
    || path.match(/^\/groups\/[^/]+\/videos\/([1-9]\d*)$/)
    || path.match(/^\/showcase\/\d+\/video\/([1-9]\d*)$/);
  if (!match) return null;
  const hash = url.searchParams.get('h') || match[2] || '';
  if (hash && !/^[a-zA-Z0-9]+$/.test(hash)) return null;
  return { id: match[1], hash };
}

export function vimeoEmbedUrl(value, { muted = false, loop = false, controls = true, background = false } = {}) {
  const video = parseVimeoUrl(value);
  if (!video) return '';
  const url = new URL(`https://player.vimeo.com/video/${video.id}`);
  if (video.hash) url.searchParams.set('h', video.hash);
  // Background playback is only requested for nearby cards. Main films start after their transition.
  Object.entries({ autoplay: background ? 1 : 0, autopause: background ? 0 : 1, muted: muted ? 1 : 0, loop: loop ? 1 : 0, controls: !background && controls ? 1 : 0, background: background ? 1 : 0, playsinline: 1, dnt: 1, title: 0, byline: 0, portrait: 0 }).forEach(([key,value]) => url.searchParams.set(key,String(value)));
  return url.href;
}

export function isVimeoHost(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return false;
  try { return /(^|\.)vimeo\.com$/i.test(new URL(value).hostname); } catch { return false; }
}
