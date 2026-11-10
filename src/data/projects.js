/**
 * =========================================================================
 * DOLLAR CREATIVE LAB — SHARED PROJECTS DATA (mirrors projects-data.js)
 * =========================================================================
 * Kept in sync with the static site's projects-data.js so the React app
 * renders the exact same projects, embeds, credits and screenshots.
 */

// Bundled demo media keeps the default portfolio usable offline.
// Replace each project's videoUrl/poster when its actual film is available.
export const PLACEHOLDER_VIDEO = '/test.mp4';
export const PLACEHOLDER_POSTER = '/showreel-poster.jpg';

// Builds the same embed HTML string the legacy modal injected via innerHTML.
function makeEmbed(src = PLACEHOLDER_VIDEO, poster = PLACEHOLDER_POSTER) {
  return `<div style="width:100%;max-width:960px;margin:0 auto;background:#000;border-radius:8px;overflow:hidden;position:relative;"><video controls autoplay playsinline preload="auto" poster="${poster}" src="${src}" style="width:100%;height:auto;display:block;outline:none;border-radius:8px;"></video></div>`;
}

export const DEFAULT_PROJECTS = [
  {
    id: 1,
    client: "JID",
    title: "Jimmy Fallon",
    category: "FINISHING",
    role: "FINISHING",
    year: "2026",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Post Producer:</b> Alex Peterson<br><b>Post Supervisor:</b> Nasser Boulaich<br><br><h3>Production</h3><b>Production Company:</b> Parallel Studios<br><b>Director:</b> Waboosh<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 2,
    client: "Nike",
    title: "Return to Football",
    category: "EDITING",
    role: "EDITING",
    year: "2025",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "",
    hasCredit: false,
    screenshots: []
  },
  {
    id: 3,
    client: "Terrace Martin & Alex Isley",
    title: "Paradise",
    category: "SOUND",
    role: "SOUND",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Sound Design:</b> Ayo Douson<br><br><h3>Production</h3><b>Director:</b> child.<br><b>Executive Producer:</b> Galileo Mondol<br><b>Executive Producer:</b> Lopes<br><b>Producer:</b> Tashi Bhutia<br><b>Production Company:</b> BT Studios<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 4,
    client: "Under Armour",
    title: "The Unstoppable Collection",
    category: "EDITING",
    role: "EDITING / SOUND",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Post Producer:</b> Alex Peterson<br><b>Post Supervisor:</b> Chris Carson<br><b>Editor:</b> Griffin Olis<br><b>Music:</b> Jile<br><b>Sound Design:</b> Ayo Douson<br><br><h3>Production</h3><b>Production Company:</b> Parallel Studios<br><b>Director:</b> Michael Kelly<br><b>Executive Producers:</b> Tony Pillow, Simon Chasalow<br><b>Lead Producer:</b> Amanda Jones<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 5,
    client: "Penderdyn",
    title: "Distillery",
    category: "COLOR",
    role: "COLOR",
    year: "2025",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Colorist:</b> Wilhends Norvil<br><br><h3>Production</h3><b>Production Company:</b> neufcinq films<br><b>Director:</b> Keirana Scott<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 6,
    client: "Guinness",
    title: "The Most Wonderful Pint",
    category: "EDITING",
    role: "EDITING / SOUND / COLOR / FINISHING",
    year: "2025",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Editor:</b> Alex Peterson<br><b>Sound Design:</b> Ayo Douson<br><b>Colorist:</b> Brian Charles<br><br><h3>Production</h3><b>Creative:</b> Taylor Agency<br><b>DP:</b> Jon Cospito<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 7,
    client: "New Balance",
    title: "Prosperity Be the Prize",
    category: "SOUND",
    role: "SOUND",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Sound Designer:</b> Ayo Douson<br><br><h3>Production</h3><b>Production Company:</b> Better Days<br><b>Directed by:</b> NAT PRINZI<br><b>Executive Producer:</b> NAT PRINZI<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 8,
    client: "Kai Cenat",
    title: "Going Professional",
    category: "EDITING",
    role: "EDITING",
    year: "2025",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Editor:</b> Griffin Olis<br><br><h3>Production</h3><b>Production Company:</b> Black Screen Productions Inc<br><b>Director:</b> Michael Daniel, Lachlan McClellan<br><b>Executive Producers:</b> Monique Carrillo, Michael Daniel<br><b>DP:</b> Jonathan Charles<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 9,
    client: "The North Face",
    title: "Fall/Winter 2024",
    category: "FINISHING",
    role: "FINISHING",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><br><h3>Production</h3><b>Producer:</b> Will Beihoffer<br><b>Director/DP:</b> Cole Pates<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 10,
    client: "MLS & Apple TV",
    title: "Beyond the Pitch",
    category: "EDITING",
    role: "EDITING / SOUND / FINISHING",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Post Supervisor:</b> Alex Peterson<br><b>Editor:</b> Griffin Olis<br><br><h3>Production</h3><b>Production Company:</b> Parallel Studios<br><b>Director:</b> Don Newkirk Jr.<br><b>Executive Producers:</b> Alex Peterson, Nate Loucks<br><b>Media Company:</b> Boardroom<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 11,
    client: "Brooks",
    title: "Sounds of Trail Running",
    category: "EDITING",
    role: "EDITING",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Editor:</b> Liam Tangum<br><br><h3>Production</h3><b>Production Comapny:</b> Stept Studios<br><b>DP:</b> Nash Howe<br><b>Head of Post:</b> Connor Scofield<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 12,
    client: "Travis Scott x Jumpman",
    title: "TREXX",
    category: "EDITING",
    role: "EDITING / SOUND / FINISHING",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Post Producer:</b> Alex Peterson<br><b>Editor:</b> Nasser Boulaich<br><b>Sound:</b> Ayo Douson<br><br><h3>Production</h3><b>Production Company:</b> GameSeven<br><b>Director:</b> Hannan Hussain<br><b>DP:</b> Mike Koziel<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 13,
    client: "Clipse",
    title: "So Be It",
    category: "EDITING",
    role: "EDITING",
    year: "2024",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Editor:</b> Nasser Boulaich<br><br><h3>Production</h3><b>Production Company:</b> Softspot<br><b>Director:</b> Hannan Hussain<br><b>DP:</b> Liam Reardon<br><br>",
    hasCredit: true,
    screenshots: []
  },
  {
    id: 14,
    client: "Justin Theroux",
    title: "A Luxury Collection Secret",
    category: "EDITING",
    role: "EDITING",
    year: "2023",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Editor:</b> Liam Tangum<br><br>",
    hasCredit: false,
    screenshots: []
  },
  {
    id: 15,
    client: "Feature Film",
    title: "A Mosquito in the Ear - Trailer",
    category: "EDITING",
    role: "EDITING",
    year: "2023",
    videoUrl: PLACEHOLDER_VIDEO,
    poster: PLACEHOLDER_POSTER,
    previewVisual: PLACEHOLDER_VIDEO,
    embed: makeEmbed(),
    credits: "<h3>Dollar</h3><b>Editor:</b> Devon Solwold<br><b>Assistant Editor:</b> Chris Carson<br><b>Editing Producer:</b> Chris Carson<br><br><h3>Production</h3><b>Production Company:</b> Greenmachine Film, Foothill Productions, Whiskey Stream Films, Steak &amp; Rosé, 5X Media, and others<br><b>Director:</b> Nicola Rinciari<br><b>DP:</b> Kai Dickson<br><b>Executive Producer:</b> Nazanin Boniadi<br><br>",
    hasCredit: true,
    screenshots: []
  }
];

// Exact 3D card layout transcribed from the .pcard data-* attributes in legacy.html.
// title/sub/tag are kept verbatim from the HTML (NOT re-derived from projects) so the
// tunnel matches the source design pixel-for-pixel.
export const INITIAL_CARDS = [
  { idx: "01", tag: "FINISHING", title: "JID", sub: "Jimmy Fallon", x: -8, y: -12, z: -500, rx: 2, ry: -3, w: 420, h: 260 },
  { idx: "02", tag: "Editing", title: "Nike", sub: "Return to Football", x: -40, y: 8, z: -1500, rx: 4, ry: -6, w: 350, h: 220 },
  { idx: "03", tag: "Sound", title: "Terrace Martin & Alex Isley", sub: "Paradise", x: 25, y: -28, z: -2000, rx: -2, ry: 4, w: 440, h: 270 },
  { idx: "04", tag: "Editing / Sound", title: "Under Armour", sub: "The Unstoppable Collection", x: -32, y: 30, z: -2500, rx: 5, ry: -4, w: 400, h: 250 },
  { idx: "05", tag: "Color", title: "Penderdyn", sub: "Distillery", x: 42, y: -18, z: -3000, rx: -5, ry: 7, w: 360, h: 230 },
  { idx: "06", tag: "Editing / Sound / Color / FINISHING", title: "Guinness", sub: "The Most Wonderful Pint", x: -25, y: -25, z: -3500, rx: 3, ry: -2, w: 460, h: 280 },
  { idx: "07", tag: "Sound", title: "New Balance", sub: "Prosperity Be the Prize", x: 38, y: 24, z: -4000, rx: -4, ry: 3, w: 390, h: 245 },
  { idx: "08", tag: "Editing", title: "Kai Cenat", sub: "Going Professional", x: -38, y: -22, z: -4500, rx: 6, ry: -5, w: 370, h: 230 },
  { idx: "09", tag: "FINISHING", title: "The North Face", sub: "Fall/Winter 2024", x: 18, y: 30, z: -5000, rx: -3, ry: -6, w: 430, h: 265 },
  { idx: "10", tag: "Editing / Sound / FINISHING", title: "MLS & Apple TV", sub: "Beyond the Pitch", x: -30, y: 28, z: -5500, rx: 4, ry: 5, w: 410, h: 255 },
  { idx: "11", tag: "Editing", title: "Brooks", sub: "Sounds of Trail Running", x: 40, y: -25, z: -6000, rx: -6, ry: -4, w: 360, h: 225 },
  { idx: "12", tag: "Editing / Sound / FINISHING", title: "Travis Scott x Jumpman", sub: "TREXX", x: -18, y: -20, z: -6500, rx: 2, ry: 3, w: 450, h: 280 },
  { idx: "13", tag: "Editing", title: "Clipse", sub: "So Be It", x: -18, y: -20, z: -6750, rx: 2, ry: 3, w: 450, h: 280 },
  { idx: "14", tag: "Editing", title: "A Luxury Collection Secret with Justin Theroux", sub: "", x: -8, y: -12, z: -7500, rx: 2, ry: -3, w: 420, h: 260 },
  { idx: "15", tag: "Editing", title: "A Mosquito in the Ear - Trailer", sub: "Feature Film", x: 35, y: 20, z: -8250, rx: -3, ry: 5, w: 380, h: 240 }
];
