# Dollar Creative Lab — React portfolio

A React 18 and Vite 6 application for a post-production studio, with GSAP reveals and browser-composited project transitions.

## Run locally

Use Node.js 24 and npm 11 (the versions validated for this project).

```sh
npm ci
npm run dev
```

Vite uses port 3000. Keep the terminal open while developing.

```sh
npm run build
npm run preview
```

The production output is `dist/`. On Vercel or Netlify, select Vite, use `npm run build`, and set the output directory to `dist`. No backend or environment variables are required for the current demo.

## Project structure

- `src/`: React components, hooks, animations, styling and project data.
- `public/`: bundled demo videos and preview frames.
- `fonts/`: the existing studio font assets.
- `scripts/export-preview.py`: optional standalone HTML export for review; it is not the application source. Run it after building with `python scripts/export-preview.py output.html`.

`index.html` is Vite's normal React entry document; `src/main.jsx` mounts the application. Downloaded standalone previews are not needed to run or deploy this project.

## Current behavior

- Pointer-controlled 3D project tunnel with projected click targets for the first 10 projects and full-screen film transitions. Card media retain their original colors.
- Editing, Color, Finishing and Sound studies.
- Scroll-controlled simulated log-look to graded video treatment.
- Animated showreel, contact and studio-name sections. Arriving at the studio ending consumes the current wheel/touch gesture; a fresh gesture continues to the next chapter.
- Keyboard navigation, dialog focus handling and reduced-motion support.

The project manager stores edits in the current browser's `localStorage`. Those edits do not update this repository, other browsers, or a deployed site's project data. Persistent shared management would require a backend or CMS.

## Content and media

Projects, titles, descriptions and posters are imported from the 27 public videos of [Dollar Creative Lab on Vimeo](https://vimeo.com/dollarcreativelab). Credits preserve the account descriptions; project years are Vimeo upload years. Confirm studio contact details and social destinations before a client launch. The existing font and original video assets are retained from the source repository; their publication rights should be confirmed by the owner.

The added color-study excerpt is from *Tears of Steel*, licensed CC BY 3.0. The source, attribution and changes are documented in [MEDIA-CREDITS.md](MEDIA-CREDITS.md) and displayed in the app. Its flat/log-like appearance is a demonstration filter, not original camera LOG. Its cropped video is 1920×720 without upscaling.

## Validation

`npm run build` is the production build check. Browser validation has exercised real project clicks and mobile taps, color progression, delivery formats, showreel wheel and touch scrolling, the studio-name transition, and responsive contact layout. `npm test` runs five Node tests for the ending gesture gate, including inertia, a second gesture, reverse navigation, and touch momentum, plus six Vimeo URL-validation and privacy-hash tests.

## Vimeo videos

The official `@vimeo/player` SDK is bundled with the app. A project's `videoUrl` accepts a complete Vimeo share URL, including its privacy hash for unlisted films. Do not put Vimeo page links in a native video element or use temporary progressive-download URLs.

```js
videoUrl: 'https://vimeo.com/VIDEO_ID/UNLISTED_HASH',
poster: 'https://your-image-host.example/project-poster.jpg'
```

Change the studio reel in `src/data/showreel.js`. The real account catalogue is in `src/data/vimeo-projects.json`; the owner-selected reel is **SELECTED BRAND WORK** (Vimeo ID `1237014270`). Setting a Vimeo URL in the local project manager changes only that browser; change the source data and push it for shared publication.

Only the single nearest eligible card loads a moving Vimeo preview; distant cards use the project's poster or a neutral placeholder. Project films use the site's own play/pause, seek, mute, volume and fullscreen controls; Vimeo's native controls are disabled. The project title appears once below the film, with credits in a collapsed About panel. Closing a project and leaving the showreel pause playback. Vimeo-backed HTML exports require Internet access for the Vimeo player and video streams.

Private/unlisted films not exposed on the public profile need their complete share URLs. No Vimeo access token belongs in this frontend.

### Refresh the public catalogue

Run `python scripts/import-vimeo.py` to refresh the studio's public titles, descriptions, upload-year metadata, and bundled JPEG posters. The importer checks the account owner ID and stops rather than silently truncating a full legacy API catalogue. Unlisted videos absent from the public profile require explicit share URLs.

The first 10 projects appear in the opening tunnel; all 27 catalogue films remain in the project archive. The ending depth follows the displayed cards rather than the full catalogue. The local manager now uses `dollar_projects_vimeo_v1`; the previous `dollar_projects_v2` key is retained without deletion so old demo edits cannot override the imported catalogue. The Color study remains the separately attributed illustrative log-look exercise described in `MEDIA-CREDITS.md`.
