// Stored project data is editable: allow formatting, never executable markup.
export function safeCredits(html = '') {
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  const allowed = new Set(['H3', 'B', 'STRONG', 'EM', 'I', 'BR', 'P', 'SPAN', 'UL', 'LI']);
  const clean = node => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    const output = document.createElement(allowed.has(node.nodeName) ? node.nodeName : 'span');
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(node.nodeName)) return output;
    node.childNodes.forEach(child => output.append(clean(child)));
    return output;
  };
  const result = document.createElement('div');
  doc.body.childNodes.forEach(child => result.append(clean(child)));
  return result.innerHTML;
}

export function mediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  // Self-contained HTML previews bundle trusted video and image assets as data URLs.
  if (/^data:(video\/mp4|image\/(jpeg|png|webp));base64,/i.test(value)) return value;
  try {
    const url = new URL(value, window.location.href);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
