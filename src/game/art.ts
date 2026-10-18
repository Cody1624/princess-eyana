import Phaser from 'phaser';
// Original 2px-grid sprites. Frames are 40×56, with six explicit animation poses.
export function createArt(scene: Phaser.Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const rect = (x: number,y: number,w: number,h: number,color: number) => g.fillStyle(color).fillRect(x,y,w,h);
  for (const princess of [false, true]) {
    for (let f = 0; f < 6; f++) {
      g.clear(); const bob = f % 2 * 2, skin=0xf3c49c, hair=princess?0x58372e:0x403e39;
      rect(10,8+bob,22,26,hair); rect(14,14+bob,18,18,skin); rect(12,8+bob,20,8,hair);
      rect(28,21+bob,3,4,0x293b41); rect(29,28+bob,3,2,0xda8a7f);
      if (princess) { rect(11,6+bob,22,5,0xe8b94d); rect(12,1+bob,4,8,0xffdb75); rect(21,0+bob,4,9,0xffdb75); rect(29,1+bob,4,8,0xffdb75); rect(14,32,17,12,0xc69bc3); rect(10,41,25,10,0xe5b1ca); rect(14,50,7,4,0x734f55); rect(25,50,7,4,0x734f55); rect(f===1?32:9,f===1?24:34,5,12,skin); }
      else { rect(12,32,20,13,0x4f9291); rect(8,33+bob,6,12,skin); rect(29,34-bob,6,11,skin); rect(13,44,8,9,0x344e62); rect(24,44,7,9,0x344e62); const step=f===2?-3:f===3?3:0; rect(10+step,51,12,5,0x513e38); rect(23-step,51,12,5,0x513e38); rect(10,31,6,11,0xddd2a8); }
      if(f===4) { rect(6,26,5,13,skin); rect(33,24,5,13,skin); }
      g.generateTexture(`${princess?'princess':'hero'}${f}`,40,56);
    }
  }
  g.clear(); rect(4,0,6,3,0xed8c91); rect(13,0,6,3,0xed8c91); rect(1,3,21,6,0xed8c91); rect(4,9,15,4,0xed8c91); rect(7,13,9,3,0xed8c91); rect(10,16,3,3,0xed8c91); g.generateTexture('heart',24,22);
  g.clear(); rect(0,0,32,8,0x86ad69); rect(0,8,32,8,0x537d55); rect(0,16,32,16,0xb58b65); rect(4,23,6,3,0x967653); rect(23,19,4,4,0xd2ab78); g.generateTexture('tile',32,32);
  g.clear(); rect(0,0,2,7,0x648666); rect(-3,0,8,4,0xf6d68b); g.generateTexture('flower',10,12); g.destroy();
  scene.anims.create({ key:'run', frames:[2,0,3,0].map(n=>({key:`hero${n}`})), frameRate:10, repeat:-1 });
  scene.anims.create({ key:'idle', frames:[0,1].map(n=>({key:`hero${n}`})), frameRate:2, repeat:-1 });
  scene.anims.create({ key:'wave', frames:[0,1].map(n=>({key:`princess${n}`})), frameRate:2, repeat:-1 });
}
