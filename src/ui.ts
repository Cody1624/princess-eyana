import { gameConfig as c } from './config/gameConfig';
import { assetPath } from './utils/assetPath';
import { audio } from './game/audio';
import type { LevelScene } from './scenes/LevelScene';
export const input = { left: false, right: false, jump: false };
export class Interface {
  storyMessage: 'opening' | null = null;
  openingZoneActive = true;
  openingDismissed = false;
  scene!: LevelScene; screen = 'menu'; blocked = new Set<string>(); hearts = 0;
  root = document.querySelector<HTMLDivElement>('#interface')!;
  setBlocked(reason: string, value: boolean) { value ? this.blocked.add(reason) : this.blocked.delete(reason); this.sync(); }
  sync() { if (!this.scene?.physics) return; const pause = this.screen !== 'play' || this.blocked.size > 0; this.scene.physics.world.isPaused = pause; audio.paused = pause; if(pause) { input.left=false; input.right=false; input.jump=false; this.scene.clearKeys(); } }
  button(text:string, action:()=>void, cls='primary') { const b=document.createElement('button'); b.className=cls; b.textContent=text; b.onclick=action; return b; }
  panel(html:string, cls='panel') { this.root.innerHTML=`<section class="${cls}">${html}</section>`; return this.root.firstElementChild as HTMLElement; }
  menu(scene:LevelScene) {
    this.scene=scene; this.screen='menu'; this.hearts=0; this.storyMessage='opening'; this.openingZoneActive=true; this.openingDismissed=false;
    const p=this.panel(`<div class="eyebrow">${c.ui.chapter}</div><div class="little-heart">♥</div><h1>${c.title.replace(/ for (.+)$/, '<br><span>for $1</span>')}</h1><p class="subtitle">${c.subtitle}</p><div class="menu-actions"></div><p class="hint">${c.ui.landscape} · ${c.ui.controls}</p><div class="dedication">${c.ui.footer}</div>`, 'menu');
    p.querySelector('.menu-actions')!.append(this.button(`${c.ui.start}  →`,()=>{audio.unlock();this.play();})); this.sync();
  }
  play() {
    this.screen='play'; this.root.innerHTML=`<div class="hud"><div class="chapter"><span class="heart-count">♥ <b id="count">${this.hearts}</b></span><span id="zone">${c.zones[0]}</span></div><div class="tools"></div></div><div id="dialogue" role="status"></div><aside id="story-message" class="story-message" aria-label="Message from Cody" hidden><p></p><div class="story-actions"></div></aside><div class="controls"><div class="directions"></div><div class="jump-control"></div></div>`;
    const tools=this.root.querySelector('.tools')!;
    tools.append(this.button('Ⅱ',()=>this.pause(),'icon')); tools.lastElementChild!.setAttribute('aria-label',c.ui.pauseLabel);
    const sound=this.button(audio.muted?'♫ ×':'♫',()=>{audio.unlock();audio.muted=!audio.muted;sound.textContent=audio.muted?'♫ ×':'♫';sound.setAttribute('aria-label',audio.muted?c.ui.soundOn:c.ui.soundOff);},'icon');sound.setAttribute('aria-label',audio.muted?c.ui.soundOn:c.ui.soundOff); tools.append(sound);
    if(document.documentElement.requestFullscreen) { const fs=this.button('⛶',()=>{void document.documentElement.requestFullscreen().catch(()=>{});},'icon');fs.setAttribute('aria-label',c.ui.fullscreen);tools.append(fs); }
    for(const [key,label,parent] of [['left','←','.directions'],['right','→','.directions'],['jump','↑','.jump-control']] as const) {
      const b=this.button(label,()=>{},`touch ${key==='jump'?'jump':''}`); b.setAttribute('aria-label',key==='jump'?c.ui.jump:key==='left'?c.ui.left:c.ui.right);
      b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input[key]=true;audio.unlock();b.classList.add('pressed');};
      const release=()=>{input[key]=false;b.classList.remove('pressed');}; b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;this.root.querySelector(parent)!.append(b);
    }
    if(this.storyMessage)this.showStory(this.storyMessage);
    this.sync();
  }
  showStory(which: 'opening') {
    this.storyMessage=which;
    const panel=this.root.querySelector<HTMLElement>('#story-message');
    if(!panel)return;
    panel.hidden=false;
    panel.querySelector('p')!.textContent=c.storyMessages[which];
    const actions=panel.querySelector('.story-actions')!;
    actions.replaceChildren(this.button(c.ui.closeMessage,()=>{panel.hidden=true;this.storyMessage=null;this.openingDismissed=true;},'text-button'));
    const dialogue=this.root.querySelector('#dialogue');
    dialogue?.classList.remove('visible');
  }
  updateOpeningPosition(firstPhotoX: number) {
    const inside = this.scene.player.x < firstPhotoX;
    if (inside !== this.openingZoneActive) {
      this.openingZoneActive = inside;
      // Returning from the photos makes the opening readable again, even
      // when it was manually dismissed on the previous visit.
      if (inside) this.openingDismissed = false;
    }
    if (inside && !this.openingDismissed) {
      if (this.storyMessage !== 'opening') this.showStory('opening');
    } else if (this.storyMessage === 'opening') {
      this.storyMessage = null;
      const panel = this.root.querySelector<HTMLElement>('#story-message');
      if (panel) panel.hidden = true;
    }
  }
  updateZone(index:number) { const el=document.querySelector('#zone');if(el)el.textContent=c.zones[index]; }
  count() { this.hearts++;const el=document.querySelector('#count');if(el)el.textContent=String(this.hearts); }
  hideDialogue() { this.root.querySelector('#dialogue')?.classList.remove('visible'); }
  say(text:string) { const x=this.scene.player.x; if(this.storyMessage||(x>=c.middleLetter.x-350&&x<=c.middleLetter.x+c.middleLetter.width+350))return; const el=document.querySelector('#dialogue');if(el) { el.textContent=text; el.classList.add('visible');setTimeout(()=>el.isConnected&&el.classList.remove('visible'),4700); } }
  pause() { if(this.screen!=='play')return;this.screen='pause';const p=this.panel(`<div class="eyebrow">${c.ui.takeTime}</div><h2>${c.ui.pause}</h2><p>${c.ui.pauseText}</p>`);p.append(this.button(c.ui.resume,()=>{audio.unlock();this.play();}),this.button(c.ui.restart,()=>this.restart(),'secondary'),this.button(audio.muted?c.ui.soundOn:c.ui.soundOff,()=>{audio.muted=!audio.muted;this.screen='play';this.pause();},'text-button'));this.sync(); }
  restart() { this.screen='menu';this.scene.scene.restart(); }
  reunion() { this.screen='reunion';this.root.innerHTML='';this.sync(); }
  victory() { this.screen='victory';const p=this.panel(`<div class="eyebrow">${c.victoryTitle}</div><div class="little-heart">♥</div><h2>${c.victoryLines[0]}<br><em>${c.victoryLines[1]}</em></h2>`,'victory panel');p.append(this.button(c.ui.happyEnding,()=>this.finale()));this.sync(); }
  finale() {this.screen='finale';const p=this.panel(`<div class="ending-photo"><img src="${assetPath(c.finalePhoto, c.photoRevision)}" alt="${c.ui.finaleAlt}"/><span>${c.ui.forever}</span></div><div class="ending-copy"><div class="eyebrow">${c.ui.foreverTitle}</div><h2 class="final-message"></h2><div class="ending-actions"></div></div>`,'finale panel');p.querySelector('.final-message')!.textContent=c.finalMessage;const actions=p.querySelector('.ending-actions')!;actions.append(this.button(c.ui.letter,()=>this.letter()),this.button(c.ui.playAgain,()=>this.restart(),'secondary'));const img=p.querySelector('img')!;img.onerror=()=>img.style.visibility='hidden';this.sync();}
  letter() {this.screen='letter';const p=this.panel(`<div class="eyebrow">${c.ui.letterEyebrow}</div><h2>${c.ui.letterTitle}</h2><div class="letter-body"></div>`,'letter panel');c.loveLetter.forEach(text=>{const el=document.createElement('p');el.textContent=text;p.querySelector('.letter-body')!.append(el);});p.append(this.button(c.ui.close,()=>this.finale(),'secondary'));this.sync();}
}
export const ui = new Interface();
