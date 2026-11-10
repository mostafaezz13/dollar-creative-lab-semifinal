import catalogue from './vimeo-projects.json';

// Selected by the studio owner from the real account's curated showcase.
export const SHOWREEL = catalogue.find(project => project.vimeoId === '1237014270');
