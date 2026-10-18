# Original art and audio

Logical canvas: 960 × 540. Terrain: 32px tiles on a 2px detail grid. Character frames: 40 × 56 transparent procedural textures; six hero and six princess poses. All art is original code-native work in `src/game/art.ts` and `src/scenes/LevelScene.ts`.

Palette: sky #aad5d7, mint #acc9ae, leaf #5c9577, cream #fff8e9, soil #b58b65, blush #e5b1ca, coral #b77670. Layered hills and clouds use independent scroll factors. The late world reveals a warm coral sky.

Hero animation metadata: idle frames 0/1 at 2 fps; run 2/0/3/0 at 10 fps; jump/fall/celebrate pose 4. Princess: idle/wave 0/1 at 2 fps; reunion pose 4. Horizontal facing uses texture flip. These sheets are generated directly as separate GPU textures; no image-generation service or copyrighted sprites are used.

Decorations include grid-based trees, flowers, a garden castle, wooden signs, scrapbook boards and pixel hearts. Five world galleries display all configured photos along a continuous row of frames. Picture frames use smooth DOM images with `object-fit: contain`, clipped to the canvas and anchored to camera coordinates on each render. Gallery photos load as the camera approaches, without pausing or opening overlays. Photos never inherit the world's nearest-neighbor texture filtering.

UI uses locally available Georgia and system monospace fonts. There are no remote font requests or third-party font licenses to manage. Audio is an original eight-note triangle-wave loop and short generated tones, synthesized locally with Web Audio after a user gesture. There are no external recordings.

The game now uses 28 real, user-supplied memories and a finale photograph. Original numbered images remain directly in `public/`. `scripts/prepare-photos.mjs` generates web-sized sRGB JPEG copies in `public/photos/` using Sharp, applies EXIF orientation, and rejects blank conversions; it never overwrites originals. Captions are edited in `src/config/gameConfig.ts` and the world displays the memories chronologically across five areas.

Visual QA: Playwright saves desktop menu, desktop/phone collage, and finale screenshots in `test-results/`. Character and terrain rendering can be inspected throughout the running game. Photographs retain their original portrait or landscape proportions.
