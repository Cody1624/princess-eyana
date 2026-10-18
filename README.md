# A Little Adventure for Eyana

An original, mobile landscape browser platformer: a single gentle journey through five scrapbook memory stops to Princess Eyana, a reunion, and a hidden love letter. Built with Phaser 3, TypeScript and Vite. No backend, tracking, accounts or persistent data.

## Run

Use Node 22 or newer:

```sh
npm ci
npm run dev
```

Open the printed local address. Desktop: arrows or A/D to move; Space, W or Up to jump; Escape to pause. Phone: hold the left/right and jump buttons simultaneously. Turn the phone to landscape. A supported fullscreen button appears in the HUD. Sound starts only after a gesture and can be muted.

```sh
npm run build
npm run preview
```

Production preview: http://localhost:4173/princess-eyana/ (the port is printed by Vite). The development base path is `/`; production and production preview use `/princess-eyana/`.

## Personalize

Edit **`src/config/gameConfig.ts`** for photos, captions, gallery copy, narrative, finale, love letter, UI labels, physics and audio volumes. The game currently uses **28 supplied memories plus one finale photograph**, with captions kept close to their original filenames, with spelling and punctuation fixes.

Original numbered photographs are kept directly in `public/`, along with `public/final_photo.JPG`. Browser-safe sRGB JPEG copies live in `public/photos/memory01.jpg` through `memory28.jpg`, plus `finale.jpg`. The game loads these smaller copies, preserving aspect ratio with contain/letterboxing. Originals are unchanged. After replacing the original photographs, regenerate the web copies with:

```sh
npm run photos
```

The converter applies photo orientation, converts to sRGB, and checks the output for blank pixels. Bump `photoRevision` in the config after replacing published photos so browsers fetch the new copies.

Add/remove entries in the config's `photos` array to change the count; it supports up to 40 photos. Memories run in chronological order across five gallery stops, in one scrolling row of framed photographs per stop. Each enlarged Polaroid follows its photograph’s natural portrait or landscape proportions, without blank sidebars. There are no placeholder slots, photo pages, or pop-ups. Images load as the camera approaches each gallery. Missing files leave their captioned frames intact.

There is one continuous 9,790px level, approximately 35 seconds of running at the current 258px/second walking speed. Photo sets have roughly 150px between them, with a separate background letter section between the third and fourth sets, and the full jump is about 30% higher than the original jump. Hearts are optional. Six 64px gaps, low bonus platforms, coyote time, jump buffering, and nearby safe checkpoints keep the route forgiving. Memory galleries never pause movement or open a photo pop-up. The opening message automatically hides when you reach the first photo set and reappears when you walk back into the opening area. Keep going can also dismiss it for the current visit. The middle message is a scenery panel between the third and fourth photo sets and scrolls with the world; neither pauses movement. These messages, the closing message after the victory card, and the two-paragraph letter are stored verbatim in the config. Progress resets with Play again; no local storage is used.

## Project map

- `src/config/gameConfig.ts`: editable content and tuning.
- `src/game/levelData.ts`: declarative terrain, hearts and checkpoints.
- `src/game/WorldPhotos.ts`: smooth, lazy-loaded photo frames anchored to the scrolling world.
- `src/game/art.ts`: original procedural character/terrain textures and animation metadata.
- `src/game/audio.ts`: original gentle synthesizer.
- `src/scenes/LevelScene.ts`: world, physics, story triggers and reunion.
- `src/ui.ts`, `src/style.css`: accessible DOM menus, collages, controls and letter.
- `src/utils/assetPath.ts`: Vite-base-safe public asset URLs.
- `ART_BIBLE.md`: palette, grid, assets and authorship.
- `.github/workflows/deploy.yml`: official GitHub Pages build/deploy workflow.

## Verify

```sh
npx playwright install chromium
npm test
```

The tests build on `dist/`, so run `npm run build` after changes. Tests run against the production base path and cover a real keyboard playthrough through all five galleries and jumps, the once-only reunion, ending, letter, replay, phone-size multi-touch, pause, mute, portrait blocking, checkpoint recovery, touch scrolling in the letter, and world display with 40 photos. Screenshots are written to `test-results/`. An existing Chromium binary can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium npm test`.

`?test=1` exposes game/UI references for the test harness; normal URLs do not. Tests emulate Chromium phone input. Physical iPhone Safari and Android devices have not been tested. Please check those devices before gifting, especially audio interruption and device safe areas.

## Deploy to GitHub Pages

1. Create a public GitHub repository named `princess-eyana`.
2. Commit these files and push to `main` (do not commit `node_modules`, `dist`, or test outputs).
3. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
4. The included workflow installs with `npm ci`, builds, uploads `dist/`, and deploys with official Pages actions. You can also run it from the Actions tab.
5. Your address will be `https://USERNAME.github.io/princess-eyana/`.

From this project folder, after creating the empty GitHub repository:

```sh
git init -b main
git add .
git commit -m "Build Eyana adventure"
git remote add origin https://github.com/USERNAME/princess-eyana.git
git push -u origin main
```

Replace `USERNAME` with your GitHub username. If this folder is already a Git repository, skip `git init` and use its existing remote as appropriate.

For a different repository name, change the base path in `vite.config.ts` and test URL in `playwright.config.ts`. This workspace has no configured Git remote, so no repository has been pushed and no live deployment is claimed.

**Privacy:** GitHub Pages and photos in a public repository/site are publicly accessible. An obscure URL does not provide privacy. Only include photographs you have permission to publish.
