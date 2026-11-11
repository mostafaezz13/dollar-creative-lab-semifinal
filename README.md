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
- Editing, Coloring, Finishing and Sound studies.
- Scroll-controlled simulated log-look to graded video treatment.
- Animated showreel, contact and studio-name sections. Arriving at the studio ending consumes the current wheel/touch gesture; a fresh gesture continues to the next chapter.
- Keyboard navigation, dialog focus handling and reduced-motion support.

The project manager stores edits in the current browser's `localStorage`. Those edits do not update this repository, other browsers, or a deployed site's project data. Persistent shared management would require a backend or CMS.

## Content and media

Projects, titles, descriptions and posters are imported from the 27 public videos of [Dollar Creative Lab on Vimeo](https://vimeo.com/dollarcreativelab). Credits preserve the account descriptions; project years are Vimeo upload years. Confirm studio contact details and social destinations before a client launch. The existing font and original video assets are retained from the source repository; their publication rights should be confirmed by the owner.

The added color-study excerpt is from *Tears of Steel*, licensed CC BY 3.0. The source, attribution and changes are documented in [MEDIA-CREDITS.md](MEDIA-CREDITS.md) and displayed in the app. Its flat/log-like appearance is a demonstration filter, not original camera LOG. Its cropped video is 1920×720 without upscaling.

## Validation

`npm run build` is the production build check. Browser validation has exercised real project clicks and mobile taps, color progression, delivery formats, showreel wheel and touch scrolling, the studio-name transition, and responsive contact layout. `npm test` covers the ending gesture gate, Vimeo URL/privacy settings, catalogue integrity, preview start offsets, mobile device detection and nearest-preview selection.

## Vimeo videos

The official `@vimeo/player` SDK is bundled with the app. A project's `videoUrl` accepts a complete Vimeo share URL, including its privacy hash for unlisted films. Do not put Vimeo page links in a native video element or use temporary progressive-download URLs.

```js
videoUrl: 'https://vimeo.com/VIDEO_ID/UNLISTED_HASH',
poster: 'https://your-image-host.example/project-poster.jpg'
```

Change the studio reel in `src/data/showreel.js`. The real account catalogue is in `src/data/vimeo-projects.json`; the owner-selected reel is **SELECTED BRAND WORK** (Vimeo ID `1237014270`). Setting a Vimeo URL in the local project manager changes only that browser; change the source data and push it for shared publication.

On desktop, all ten tunnel films load together, start halfway through their actual duration, and loop silently. Their desktop players stay mounted and playing when cards move out of view or a project opens. On phones/tablets and narrow screens, no player loads during the opening sequence; only the nearest card loads after the loader exits and the selection settles for 240 ms. This player is released when the card changes, a menu/project opens, the ending arrives, or the tab is hidden. Vimeo autopause is disabled for background previews. Project films use the site's own play/pause, seek, mute, volume and fullscreen controls; Vimeo's native controls are disabled. The project title appears once below the film, with credits in a collapsed About panel. Closing a project and leaving the showreel pause playback. Vimeo-backed HTML exports require Internet access for the Vimeo player and video streams.

Private/unlisted films not exposed on the public profile need their complete share URLs. No Vimeo access token belongs in this frontend.

### Refresh the public catalogue

Run `python scripts/import-vimeo.py` to refresh the studio's public titles, descriptions, upload-year metadata, and bundled JPEG posters. The importer checks the account owner ID and stops rather than silently truncating a full legacy API catalogue. Unlisted videos absent from the public profile require explicit share URLs.

The first 10 projects appear in the opening tunnel; all 27 catalogue films remain in the project archive. The ending depth follows the displayed cards rather than the full catalogue. The local manager now uses `dollar_projects_vimeo_v1`; the previous `dollar_projects_v2` key is retained without deletion so old demo edits cannot override the imported catalogue. The Color study remains the separately attributed illustrative log-look exercise described in `MEDIA-CREDITS.md`.

### Studio motion

The opening sequence preloads fonts and the first three local posters, then reveals the tunnel with a split shutter. Video loading never blocks entry; a five-second asset deadline also prevents a stalled request from trapping visitors. Reduced-motion visitors get a short, static transition.

The tunnel ending uses whole-word typography, a CSS metal sculpture, real project stills and pointer parallax. Its existing two-gesture scroll gate is preserved. Liquid button decoration is inspired by [Extee Studio’s Venom Button](https://exteestudio.github.io/venom-button/), implemented locally with one shared Canvas 2D surface and delegated pointer handlers. It preserves native click targets and keyboard behavior; playback buttons get a smaller effect, touch gets pressed-state shading, and reduced motion disables the liquid animation. No third-party script is loaded at runtime.

### Brand identity

The palette is defined in `src/brand.css`: Dollar Green `#20D13A`, Deep Violet `#24005A`, Near Black `#08080B`, Soft White `#F5F3F7`, and Acid Lime `#B7FF5A`. Green is the primary action color; violet adds depth, and lime is reserved for small highlights. The archive retains its animated light surface.

`BrandLogo` shares the transparent web artwork prepared from the studio-supplied logo reference at `public/brand/dollar-logo.png` across the header, opening loader, tunnel ending and contact footer. Replace this asset with the original transparent master if one becomes available; all placements update together. The image keeps its colors in both themes.

The services are Editing, Color, Sound and Finishing, in that order. Visual panels and audio cleanup use the service name rather than its numeric position so descriptions and interactive studies stay matched.

### Work previews and page motion

Work hover previews prefer the project's actual film URL and play silently from its midpoint. Up to three preview players stay mounted; returning to a cached row resumes its player. Work prepares two likely previews as the archive approaches the viewport. Vimeo is briefly primed while muted to complete the initial seek, then inactive previews pause. Pointer previews stay inside the screen; touch devices open the project directly. Constrained devices never create the hover preview pool, including in landscape.

`useReveal` animates elements into and out of the viewport repeatedly, including reverse scrolling and dynamically filtered rows. Independent translate/rotate/scale properties preserve the existing scene transforms. Filters and service tabs animate old content out before replacement; split text, header links, project details and the project manager have matching transitions. Reduced-motion mode keeps content visible and skips the decorative movement.

### Mobile playback budget

`useMobilePerformance` detects narrow screens, mobile user agents, coarse pointers and desktop-style iPadOS. The constrained policy survives rotation. Mobile Showreel players mount only while the section is visible, and unmount on departure; desktop retains its existing behavior.

The large tunnel floor grid is omitted on mobile. Camera idle drift and pointer tilt are disabled, projected hit targets update only when geometry changes, distant background word layers are omitted, and entrance/exit motion uses opacity and translation without 3D tilt. The opening curtains remain, without the full-screen zoom or logo blur. Desktop visuals and simultaneous playback are preserved.

Browser verification checks zero Vimeo iframes throughout the mobile preloader, a maximum of one through tunnel/project/Showreel navigation, no hidden Work pool, landscape behavior and the ten-player desktop path. These checks use a mobile viewport; confirmation of the reported WebKit process crash still requires testing the deployed fix on the affected iPhone.
