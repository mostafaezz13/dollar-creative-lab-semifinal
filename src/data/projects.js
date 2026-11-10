import catalogue from './vimeo-projects.json';

// The public catalogue is imported from the studio's own Vimeo profile.
export const DEFAULT_PROJECTS = catalogue;
export const PROJECTS_STORAGE_KEY = 'dollar_projects_vimeo_v1';
// Fallbacks use real studio media; no shared demo film is shown for project cards.
export const PLACEHOLDER_VIDEO = catalogue[0].videoUrl;
export const PLACEHOLDER_POSTER = catalogue[0].poster;

const BASE_LAYOUT = [
  {
    "x": -8,
    "y": -12,
    "z": -500,
    "rx": 2,
    "ry": -3,
    "w": 420,
    "h": 260
  },
  {
    "x": -40,
    "y": 8,
    "z": -1500,
    "rx": 4,
    "ry": -6,
    "w": 350,
    "h": 220
  },
  {
    "x": 25,
    "y": -28,
    "z": -2000,
    "rx": -2,
    "ry": 4,
    "w": 440,
    "h": 270
  },
  {
    "x": -32,
    "y": 30,
    "z": -2500,
    "rx": 5,
    "ry": -4,
    "w": 400,
    "h": 250
  },
  {
    "x": 42,
    "y": -18,
    "z": -3000,
    "rx": -5,
    "ry": 7,
    "w": 360,
    "h": 230
  },
  {
    "x": -25,
    "y": -25,
    "z": -3500,
    "rx": 3,
    "ry": -2,
    "w": 460,
    "h": 280
  },
  {
    "x": 38,
    "y": 24,
    "z": -4000,
    "rx": -4,
    "ry": 3,
    "w": 390,
    "h": 245
  },
  {
    "x": -38,
    "y": -22,
    "z": -4500,
    "rx": 6,
    "ry": -5,
    "w": 370,
    "h": 230
  },
  {
    "x": 18,
    "y": 30,
    "z": -5000,
    "rx": -3,
    "ry": -6,
    "w": 430,
    "h": 265
  },
  {
    "x": -30,
    "y": 28,
    "z": -5500,
    "rx": 4,
    "ry": 5,
    "w": 410,
    "h": 255
  },
  {
    "x": 40,
    "y": -25,
    "z": -6000,
    "rx": -6,
    "ry": -4,
    "w": 360,
    "h": 225
  },
  {
    "x": -18,
    "y": -20,
    "z": -6500,
    "rx": 2,
    "ry": 3,
    "w": 450,
    "h": 280
  },
  {
    "x": -18,
    "y": -20,
    "z": -6750,
    "rx": 2,
    "ry": 3,
    "w": 450,
    "h": 280
  },
  {
    "x": -8,
    "y": -12,
    "z": -7500,
    "rx": 2,
    "ry": -3,
    "w": 420,
    "h": 260
  },
  {
    "x": 35,
    "y": 20,
    "z": -8250,
    "rx": -3,
    "ry": 5,
    "w": 380,
    "h": 240
  }
];
export const INITIAL_CARDS = catalogue.map((project,index) => ({
  ...BASE_LAYOUT[index % BASE_LAYOUT.length],
  idx: String(index + 1).padStart(2,'0'),
  z: index < BASE_LAYOUT.length ? BASE_LAYOUT[index].z : BASE_LAYOUT.at(-1).z - (index - BASE_LAYOUT.length + 1) * 550
}));
