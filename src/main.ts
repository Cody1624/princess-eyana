import Phaser from 'phaser';
import { LevelScene } from './scenes/LevelScene';
import { gameConfig } from './config/gameConfig';
import { ui } from './ui';
import './style.css';
document.querySelector('#orientation h2')!.textContent=gameConfig.ui.rotateTitle;
document.querySelector('#orientation p')!.textContent=gameConfig.ui.rotateText;
ui.root.textContent=gameConfig.ui.loading;
const viewport=()=>({width:window.visualViewport?.width??window.innerWidth,height:window.visualViewport?.height??window.innerHeight});
const initial=viewport();
const game = new Phaser.Game({ type: Phaser.AUTO, parent:'game',width:Math.round(540*initial.width/initial.height),height:540, backgroundColor:'#acd6d6',render:{pixelArt:true,roundPixels:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:gameConfig.movement.gravity},debug:false}},scene:[LevelScene],audio:{noAudio:true} });
const orient=()=>{const portrait=window.innerHeight>window.innerWidth;document.querySelector('#orientation')!.classList.toggle('show',portrait);ui.setBlocked('orientation',portrait);};
const resize=()=>{
 const size=viewport(),app=document.querySelector<HTMLElement>('#app')!;
 app.style.width=`${size.width}px`;app.style.height=`${size.height}px`;
 if(game.isBooted){game.scale.setGameSize(Math.round(540*size.width/size.height),540);game.scale.refresh();}
 orient();
};
game.events.once(Phaser.Core.Events.READY,resize);
window.addEventListener('resize',resize);
window.visualViewport?.addEventListener('resize',resize);
resize();
document.addEventListener('visibilitychange',()=>{ui.setBlocked('hidden',document.hidden);if(!document.hidden&&ui.screen==='play')ui.pause();});
window.addEventListener('blur',()=>{if(ui.screen==='play')ui.pause();});
window.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('dragstart',e=>{if(e.target instanceof HTMLImageElement||e.target instanceof HTMLCanvasElement)e.preventDefault();});
if(new URLSearchParams(location.search).has('test'))Object.assign(window,{__game:game,__ui:ui,__config:gameConfig});
