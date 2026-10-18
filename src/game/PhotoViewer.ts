import { gameConfig as c } from '../config/gameConfig';

let currentClose: (() => void) | undefined;

/** No download links or native image save menu; public images remain retrievable. */
export function openPhoto(src: string, caption: string, setOpen: (open: boolean) => void) {
  currentClose?.();
  const previousFocus = document.activeElement as HTMLElement | null;
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-label', caption);
  const back = document.createElement('button');
  back.className = 'secondary photo-back';
  back.textContent = c.ui.close;
  const canvas = document.createElement('canvas');
  canvas.className = 'photo-enlarged';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', caption);
  canvas.hidden = true;
  const status = document.createElement('p');
  status.className = 'photo-status';
  status.setAttribute('role', 'status');
  status.textContent = c.ui.photoLoading;
  const label = document.createElement('p');
  label.className = 'photo-caption';
  label.textContent = caption;
  dialog.append(back, canvas, status, label);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    dialog.remove();
    setOpen(false);
    currentClose = undefined;
    previousFocus?.isConnected && previousFocus.focus({ preventScroll: true });
  };
  currentClose = close;
  back.onclick = close;
  dialog.oncancel = event => { event.preventDefault(); close(); };
  dialog.onkeydown = event => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); close(); }
  };
  dialog.oncontextmenu = event => event.preventDefault();
  dialog.ondragstart = event => event.preventDefault();
  document.body.append(dialog);
  setOpen(true);
  if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  back.focus();
  const image = new Image();
  image.onload = () => {
    if (closed) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d')!.drawImage(image, 0, 0);
    canvas.hidden = false;
    status.hidden = true;
  };
  image.onerror = () => { if (!closed) status.textContent = c.ui.photoError; };
  image.src = src;
}
