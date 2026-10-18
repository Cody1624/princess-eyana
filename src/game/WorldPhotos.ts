import type Phaser from 'phaser';
import { gameConfig as c } from '../config/gameConfig';
import { assetPath } from '../utils/assetPath';

/** Smooth photographs anchored to world coordinates, above the player's path. */
export class WorldPhotos {
  root = document.createElement('div');
  stage = document.createElement('div');
  hero = document.createElement('canvas');
  groups: { element: HTMLElement; x: number; width: number; loaded: boolean }[] = [];

  constructor(private scene: Phaser.Scene) {
    this.root.id = 'world-photos';
    this.root.setAttribute('aria-label', c.ui.memory);
    this.stage.className = 'world-photo-stage';
    this.root.append(this.stage);
    document.querySelector('#app')!.insertBefore(this.root, document.querySelector('#interface'));
    c.galleries.forEach((gallery, index) => {
      // Keep the numbered memories chronological from the first stop to the last.
      const start = Math.floor(index * c.photos.length / c.galleries.length);
      const end = Math.floor((index + 1) * c.photos.length / c.galleries.length);
      const photos = c.photos.slice(start, end);
      const width = Math.max(1, photos.length) * 220;
      const group = document.createElement('section');
      group.className = 'world-gallery';
      group.style.left = `${gallery.x - width / 2}px`;
      group.style.width = `${width}px`;
      const title = document.createElement('h2');
      title.textContent = `${String(index + 1).padStart(2, '0')} / ${gallery.title}`;
      group.append(title);
      const grid = document.createElement('div');
      grid.className = 'world-photo-grid';
      const entry = { element: group, x: gallery.x, width, loaded: false };
      const layout = () => {
        entry.width = grid.offsetWidth;
        group.style.width = `${entry.width}px`;
        group.style.left = `${gallery.x - entry.width / 2}px`;
      };
      photos.forEach((photo, i) => {
        const frame = document.createElement('figure');
        frame.className = 'world-polaroid';
        frame.style.rotate = `${[ -3, 2, -1, 3 ][i % 4]}deg`;
        const img = document.createElement('img');
        img.dataset.src = assetPath(photo.src, c.photoRevision);
        img.alt = photo.caption;
        img.decoding = 'async';
        img.onload = () => {
          // Size both the print and its frame from the actual photo proportions.
          const scale = Math.min(184 / img.naturalHeight, 300 / img.naturalWidth);
          const width = img.naturalWidth * scale;
          img.style.width = `${width}px`;
          img.style.height = `${img.naturalHeight * scale}px`;
          frame.style.width = `${width + 18}px`;
          layout();
        };
        img.onerror = () => { img.style.visibility = 'hidden'; };
        const caption = document.createElement('figcaption');
        caption.textContent = photo.caption;
        frame.append(img, caption);
        grid.append(frame);
      });
      group.append(grid);
      this.stage.append(group);
      this.groups.push(entry);
      layout();
    });
    // A separate scenery panel between photo sets three and four, on the
    // same world layer as the frames; it scrolls away naturally with the camera.
    const letter = document.createElement('article');
    letter.className = 'world-letter';
    letter.style.left = `${c.middleLetter.x}px`;
    letter.style.width = `${c.middleLetter.width}px`;
    const text = document.createElement('p');
    text.textContent = c.storyMessages.middle;
    letter.append(text);
    this.stage.append(letter);
    // Keep the adventurer visible in front of the scrapbook during higher jumps.
    // The original canvas sprite remains the physics/animation source.
    this.hero.width = 40;
    this.hero.height = 56;
    this.hero.className = 'world-adventurer';
    this.hero.setAttribute('aria-hidden', 'true');
    this.stage.append(this.hero);
    scene.events.on('render', this.update, this);
    scene.events.once('shutdown', () => {
      scene.events.off('render', this.update, this);
      this.root.remove();
    });
  }

  update() {
    const camera = this.scene.cameras.main;
    const rect = this.scene.game.canvas.getBoundingClientRect();
    this.root.style.left = `${rect.left}px`;
    this.root.style.top = `${rect.top}px`;
    this.root.style.width = `${rect.width}px`;
    this.root.style.height = `${rect.height}px`;
    this.stage.style.transform = `scale(${rect.width / 960}) translate(${-camera.scrollX}px, ${-camera.scrollY}px)`;
    const hero = this.scene.children.getByName('adventurer') as Phaser.GameObjects.Sprite | null;
    if (hero) {
      this.hero.style.left = `${hero.x - 20}px`;
      this.hero.style.top = `${hero.y - 28}px`;
      const context = this.hero.getContext('2d')!;
      context.clearRect(0, 0, 40, 56);
      context.imageSmoothingEnabled = false;
      context.save();
      if (hero.flipX) { context.translate(40, 0); context.scale(-1, 1); }
      context.drawImage(hero.texture.getSourceImage() as CanvasImageSource, 0, 0, 40, 56);
      context.restore();
    }
    for (const group of this.groups) {
      if (!group.loaded && Math.abs(group.x - (camera.scrollX + 480)) < 1400 + group.width / 2) {
        group.element.querySelectorAll('img').forEach(img => { img.src = img.dataset.src!; });
        group.loaded = true;
      }
    }
  }
}
