import Phaser from 'phaser';
import { gameConfig as c } from '../config/gameConfig';
import { createArt } from '../game/art';
import { audio } from '../game/audio';
import { WORLD_WIDTH, GOAL_X, GROUND_Y, platforms, checkpoints, heartPositions } from '../game/levelData';
import { ui, input } from '../ui';
import { WorldPhotos } from '../game/WorldPhotos';
export class LevelScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite; princess!:Phaser.GameObjects.Sprite;
  keys!: Record<string,Phaser.Input.Keyboard.Key>; hearts!:Phaser.Physics.Arcade.StaticGroup;
  seen=new Set<number>(); messages=new Set<number>(); checkpoint=100; lastGround=0; jumpAt=-1000; previousJump=false; ending=false; sky!:Phaser.GameObjects.Graphics;
  worldPhotos!:WorldPhotos;
  constructor() {super('Level');}
  create() {
    this.seen=new Set();this.messages=new Set();this.checkpoint=100;this.lastGround=0;this.jumpAt=-1000;this.previousJump=false;this.ending=false;
    if(!this.textures.exists('hero0'))createArt(this);
    this.physics.world.setBounds(0,-200,WORLD_WIDTH,1000);
    this.drawWorld();
    const originalSkyWidth=this.scale.width;
    const resizeSky=()=>this.sky.setScale(this.scale.width/originalSkyWidth,1);
    this.scale.on('resize',resizeSky);
    this.events.once('shutdown',()=>this.scale.off('resize',resizeSky));
    this.worldPhotos=new WorldPhotos(this);
    const solid=this.physics.add.staticGroup();
    for(const p of platforms) {
      const block=this.add.zone(p.x+p.width/2,p.y+p.height/2,p.width,p.height);solid.add(block);
      this.add.rectangle(p.x,p.y+24,p.width,p.height-24,0xb58b65).setOrigin(0).setDepth(2);
      this.add.tileSprite(p.x,p.y,p.width,32,'tile').setOrigin(0).setDepth(3);
    }
    this.player=this.physics.add.sprite(100,GROUND_Y-28,'hero0').setName('adventurer').setDepth(10);this.player.setSize(23,49).setOffset(10,6).setMaxVelocity(c.movement.speed,650).setDragX(c.movement.drag);
    this.physics.add.collider(this.player,solid);
    this.hearts=this.physics.add.staticGroup();
    for(const h of heartPositions) {const s=this.hearts.create(h.x,h.y,'heart') as Phaser.Physics.Arcade.Sprite;s.setDepth(5);this.tweens.add({targets:s,y:h.y-7,duration:1000,yoyo:true,repeat:-1});}
    this.physics.add.overlap(this.player,this.hearts,(_p,h)=>{const heart=h as Phaser.Physics.Arcade.Sprite;heart.destroy();ui.count();audio.tone(784);});
    this.princess=this.add.sprite(GOAL_X,GROUND_Y-28,'princess0').setDepth(10).play('wave');
    this.cameras.main.setBounds(0,0,WORLD_WIDTH,540).startFollow(this.player,true,.09,.09, -160,0).setDeadzone(40,110);
    this.keys=this.input.keyboard!.addKeys('LEFT,RIGHT,UP,SPACE,A,D,W,ESC') as typeof this.keys;
    this.keys.ESC.on('down',()=>{if(ui.screen==='play')ui.pause();else if(ui.screen==='pause')ui.play();});
    ui.menu(this);
  }
  clearKeys() { if(this.keys)for(const key of Object.values(this.keys))key.reset();this.previousJump=false;this.jumpAt=-1000; }
  drawWorld() {
    const sky=this.sky=this.add.graphics().setScrollFactor(0).setDepth(-20);
    for(let y=0;y<540;y+=4)sky.fillStyle(Phaser.Display.Color.GetColor(170+Math.floor(y*.12),213+Math.floor(y*.025),215-Math.floor(y*.06))).fillRect(0,y,this.scale.width,4);
    this.add.circle(775,100,42,0xffebbc).setScrollFactor(.04).setDepth(-18);
    const hills=this.add.graphics().setScrollFactor(.16).setDepth(-14);
    for(let i=0;i<12;i++) {hills.fillStyle(i%2?0x94baa5:0xacc9ae).fillEllipse(i*310,400,670,330);}
    const far=this.add.graphics().setScrollFactor(.35).setDepth(-12);
    for(let i=0;i<20;i++)far.fillStyle(0x81a58a).fillEllipse(i*300,470,480,200);
    for(let i=0;i<28;i++) {const x=i*580;const cloud=this.add.graphics().setDepth(-16).setScrollFactor(.23);cloud.fillStyle(0xfff9e9,.85);cloud.fillRect(x,74+(i%3)*30,100,20);cloud.fillRect(x+20,62+(i%3)*30,50,18);}
    const distant=this.add.graphics().setScrollFactor(.1).setDepth(-11);
    distant.fillStyle(0xe0d8b8).fillRect(770,272,115,91).fillRect(757,250,30,113).fillRect(867,250,30,113);
    distant.fillStyle(0xa49a9a).fillTriangle(749,250,772,218,795,250).fillTriangle(859,250,882,218,905,250);
    distant.fillStyle(0x9dab9d).fillRect(817,320,22,43);
    const decor=this.add.graphics().setDepth(1);
    for(let x=180;x<WORLD_WIDTH;x+=630) {decor.fillStyle(0x826f51).fillRect(x,325,16,113);decor.fillStyle(0x5c9577).fillRect(x-42,269,100,75);decor.fillStyle(0x73a582).fillRect(x-28,244,72,75);decor.fillStyle(0x8bb48d).fillRect(x-12,234,42,42);}
    for(let x=20;x<WORLD_WIDTH;x+=47) {if(!platforms.some(p=>p.y===GROUND_Y&&x>=p.x&&x<p.x+p.width))continue;decor.fillStyle(0x678960).fillRect(x,424,3,14);decor.fillStyle(x%3?0xf1d694:0xe8a1a1).fillRect(x-3,420,9,5);}
    this.sign(400,c.ui.sign);this.sign(GOAL_X-680,c.ui.finalSign);
    const castle=this.add.graphics().setDepth(1).setPosition(GOAL_X,0);
    // Original garden castle, built on a consistent two-pixel grid.
    castle.fillStyle(0xe1c4b0).fillRect(-220,245,430,193);castle.fillStyle(0xf1dcc1).fillRect(-182,219,76,219).fillRect(84,219,76,219);castle.fillStyle(0xb4838a).fillTriangle(-196,220,-144,151,-92,220).fillTriangle(70,220,122,151,174,220);castle.fillStyle(0xc3979b).fillRect(-84,255,160,183);castle.fillStyle(0x796b71).fillRoundedRect(-35,345,62,93,30);
    for(const x of [-158,108])castle.fillStyle(0x8b9da0).fillRect(x,257,26,40);
    castle.fillStyle(0x72916b).fillRect(-350,402,650,36);
    for(let i=0;i<30;i++){castle.fillStyle(i%2?0xe6a3a4:0xffd99b).fillRect(-340+i*21,396+i%3*6,8,8);}
  }
  sign(x:number,text:string) {this.add.rectangle(x,408,7,60,0x8b7457).setDepth(3);this.add.text(x,369,text,{fontFamily:'monospace',fontSize:'12px',color:'#fff4d7',backgroundColor:'#827858',padding:{x:10,y:8}}).setOrigin(.5).setDepth(4);}
  update(time:number) {
    if(!this.player||ui.screen!=='play'||ui.blocked.size)return;
    const body=this.player.body as Phaser.Physics.Arcade.Body;
    const grounded=body.blocked.down||body.touching.down;if(grounded)this.lastGround=time;
    const left=input.left||this.keys.LEFT.isDown||this.keys.A.isDown,right=input.right||this.keys.RIGHT.isDown||this.keys.D.isDown;
    const jumping=input.jump||this.keys.UP.isDown||this.keys.SPACE.isDown||this.keys.W.isDown;
    if(jumping&&!this.previousJump)this.jumpAt=time;
    if(time-this.jumpAt<c.movement.bufferMs&&time-this.lastGround<c.movement.coyoteMs){this.player.setVelocityY(c.movement.jumpVelocity);this.jumpAt=-1000;this.lastGround=-1000;audio.tone(420,.1);}
    if(!jumping&&this.previousJump&&body.velocity.y< -180)this.player.setVelocityY(body.velocity.y*.55);
    this.previousJump=jumping;
    this.player.setAccelerationX(left===right?0:left?-c.movement.acceleration:c.movement.acceleration);
    if(left!==right)this.player.setFlipX(left);
    if(!grounded){this.player.anims.stop();this.player.setTexture('hero4');}else this.player.play(Math.abs(body.velocity.x)>20?'run':'idle',true);
    this.player.x=Phaser.Math.Clamp(this.player.x,20,WORLD_WIDTH-20);
    const x=this.player.x;for(const cp of checkpoints)if(x>=cp)this.checkpoint=Math.max(this.checkpoint,cp);
    if(this.player.y>650){this.player.setPosition(this.checkpoint,GROUND_Y-50).setVelocity(0);this.cameras.main.flash(220,255,245,225);}
    const firstGallery=this.worldPhotos.groups[0];
    if(firstGallery)ui.updateOpeningPosition(firstGallery.x-firstGallery.width/2);
    ui.updateZone(x<1800?0:x<3850?1:x<6720?2:x<8350?3:4);
    if(x>=c.middleLetter.x-350&&x<=c.middleLetter.x+c.middleLetter.width+350)ui.hideDialogue();
    for(let i=0;i<c.dialogue.length;i++)if(x>=c.dialogue[i].x&&!this.messages.has(i)){this.messages.add(i);ui.say(c.dialogue[i].text);}
    for(let i=0;i<c.galleries.length;i++)if(x>=c.galleries[i].x-70&&!this.seen.has(i)){this.seen.add(i);ui.say(c.galleries[i].message);}
    this.sky.setAlpha(1-Phaser.Math.Clamp((x-7350)/(WORLD_WIDTH-7350),0,.85));
    this.cameras.main.setBackgroundColor(x>7350?'#edc2af':'#abd8d9');
    if(x>=GOAL_X-100&&!this.ending)this.reunite();
  }
  reunite() {
    this.ending=true;this.player.setVelocity(0).setAcceleration(0);this.player.anims.stop();ui.reunion();
    this.princess.play('wave');this.player.setFlipX(false);this.player.play('run');
    this.tweens.add({targets:this.player,x:GOAL_X-20,duration:1100,onComplete:()=>{this.player.anims.stop();this.player.setTexture('hero4');this.princess.anims.stop();this.princess.setTexture('princess4').setFlipX(true);audio.jingle();}});
    for(let i=0;i<22;i++)this.time.delayedCall(1000+i*85,()=>{const heart=this.add.image(GOAL_X-10+Math.sin(i*8)*52,397,'heart').setDepth(20);this.tweens.add({targets:heart,y:230-i%4*20,alpha:0,duration:2000,onComplete:()=>heart.destroy()});});
    this.time.delayedCall(3400,()=>ui.victory());
  }
}
