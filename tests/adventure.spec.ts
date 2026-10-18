import { test, expect } from '@playwright/test';
import { gameConfig } from '../src/config/gameConfig';
import sharp from 'sharp';
import { gaps } from '../src/game/levelData';
import messages from './messages.json' with { type: 'json' };
test('complete route, five world galleries, reunion, letter and replay under Pages base path',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message);});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('?test=1');await expect(page.getByRole('button',{name:'Start adventure'})).toBeVisible();
  await page.screenshot({path:'test-results/menu-desktop.png'});await page.getByRole('button',{name:'Start adventure'}).click();
  await page.keyboard.down('ArrowRight');const visited=new Set<number>();let iterations=0;
  while(iterations++<1000){
    const s=await page.evaluate(()=>{const w=window as any;const scene=w.__game.scene.getScene('Level');return {x:scene.player.x,y:scene.player.y,ground:scene.player.body.blocked.down,screen:w.__ui.screen,galleries:[...scene.seen],messages:[...scene.messages]};});
    if(iterations%100===0)console.log('Route progress',s.x,s.y,s.screen);
    for(const id of s.galleries)visited.add(id);
    expect(s.screen).not.toBe('gallery');
    if(['reunion','victory','finale'].includes(s.screen))break;
    if(s.ground&&gaps.some(g=>s.x>g-45&&s.x<g+60)) {await page.keyboard.down('Space');await page.waitForTimeout(240);await page.keyboard.up('Space');}
    await page.waitForTimeout(80);
  }
  await page.keyboard.up('ArrowRight');expect(visited.size).toBe(5);expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').messages.size)).toBe(8);
  console.log('Reached reunion; checking victory');
  await expect(page.getByText('YOU FOUND PRINCESS EYANA!')).toBeVisible({timeout:10000});
  page.setDefaultTimeout(15000);
  await page.getByRole('button',{name:'Our happy ending'}).click();await expect(page.getByText(messages.ending,{exact:true})).toBeVisible();
  await expect(page.locator('.ending-photo img')).toHaveJSProperty('complete',true);await expect(page.locator('.ending-photo img')).not.toHaveJSProperty('naturalWidth',0);await page.screenshot({path:'test-results/finale-desktop.png'});
  console.log('Ending photo loaded; opening letter');
  await page.getByRole('button',{name:'One more thing'}).click();await expect(page.getByText(messages.letter[0],{exact:true})).toBeVisible();await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Play again'}).click();await expect(page.getByRole('button',{name:'Start adventure'})).toBeVisible();expect(errors).toEqual([]);
});
test('phone landscape multitouch, pause, mute, portrait, gallery and checkpoint recovery',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});const page=await context.newPage();await page.goto('?test=1');await page.getByRole('button',{name:'Start adventure'}).tap();
 const right=await page.getByRole('button',{name:'Move right'}).boundingBox(),jump=await page.getByRole('button',{name:'Jump',exact:true}).boundingBox();const session=await context.newCDPSession(page);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:right!.x+20,y:right!.y+20,id:1},{x:jump!.x+20,y:jump!.y+20,id:2}]});await page.waitForTimeout(300);
 const moving=await page.evaluate(()=>{const s=(window as any).__game.scene.getScene('Level');return {x:s.player.x,y:s.player.y};});expect(moving.x).toBeGreaterThan(115);expect(moving.y).toBeLessThan(390);await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.getByRole('button',{name:'Pause',exact:true}).tap();await expect(page.getByText('A little breather')).toBeVisible();await page.getByRole('button',{name:'Keep adventuring'}).tap();await page.getByRole('button',{name:'Sound off',exact:true}).tap();await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
 await page.evaluate(()=>{const s=(window as any).__game.scene.getScene('Level');s.player.setPosition(1700,400);});await expect(page.locator('.world-gallery').first()).toBeVisible();await page.waitForTimeout(300);expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').physics.world.isPaused)).toBe(false);await page.screenshot({path:'test-results/gallery-phone.png'});
 await page.evaluate(()=>{const s=(window as any).__game.scene.getScene('Level');s.player.setPosition(1800,700);});await page.waitForTimeout(250);expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').player.y)).toBeLessThan(450);
 await page.setViewportSize({width:390,height:844});await expect(page.getByText('Turn your phone sideways.')).toBeVisible();expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').physics.world.isPaused)).toBe(true);await page.setViewportSize({width:844,height:390});await expect(page.getByText('Turn your phone sideways.')).toBeHidden();await context.close();
});

test('all photo slots resolve under the deployed subpath and contain visible pixels',async({request})=>{
 for(const file of [...gameConfig.photos.map(photo=>photo.src),gameConfig.finalePhoto]){const r=await request.get(file);expect(r.ok()).toBe(true);expect(r.headers()['content-type']).toContain('image/jpeg');const pixels=await sharp(await r.body()).stats();expect(pixels.channels.some(channel=>channel.stdev>0.5),`${file} must contain visible image detail`).toBe(true);expect(Math.max(...pixels.channels.map(channel=>channel.max)),`${file} must not be black`).toBeGreaterThan(10);}
});

test('five world galleries show every photo without interrupting movement',async({page})=>{
 await page.goto('?test=1');await page.getByRole('button',{name:'Start adventure'}).click();
 await expect(page.locator('.world-gallery')).toHaveCount(5);await expect(page.locator('.world-polaroid')).toHaveCount(gameConfig.photos.length);
 await expect(page.locator('.world-polaroid figcaption')).toHaveText(gameConfig.photos.map(photo=>photo.caption));
 for(let i=0;i<5;i++) {
  await page.evaluate(index=>{const w=window as any;const s=w.__game.scene.getScene('Level');s.player.setPosition(w.__config.galleries[index].x-80,410).setVelocity(0);},i);
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(700);await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(()=>(window as any).__ui.screen)).toBe('play');
  expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').physics.world.isPaused)).toBe(false);
  const photos=page.locator('.world-gallery').nth(i).locator('img');
  for(const img of await photos.all()){
   await expect(img).toHaveJSProperty('complete',true);await expect(img).not.toHaveJSProperty('naturalWidth',0);
   const geometry=await img.evaluate(el=>{const image=el as HTMLImageElement;const frame=image.closest('figure')!;return {width:parseFloat(getComputedStyle(image).width),height:parseFloat(getComputedStyle(image).height),ratio:image.naturalWidth/image.naturalHeight,frameWidth:parseFloat(getComputedStyle(frame).width)};});
   expect(geometry.width/geometry.height).toBeCloseTo(geometry.ratio,2);
   expect(geometry.frameWidth-geometry.width).toBeCloseTo(18,0);
   expect(geometry.height).toBeGreaterThan(136);
  }
 }
 const strips=await page.locator('.world-gallery').evaluateAll(groups=>groups.map(group=>({left:parseFloat((group as HTMLElement).style.left),width:parseFloat((group as HTMLElement).style.width)})));
 for(let i=1;i<strips.length;i++){
  if(i===3)continue;
  const space=strips[i].left-strips[i-1].left-strips[i-1].width;expect(space).toBeGreaterThan(100);expect(space).toBeLessThan(200);
 }
 const note=await page.locator('.world-letter').evaluate(el=>({left:parseFloat((el as HTMLElement).style.left),width:parseFloat((el as HTMLElement).style.width)}));
 expect(note.left-strips[2].left-strips[2].width).toBeGreaterThan(100);
 expect(strips[3].left-note.left-note.width).toBeGreaterThan(100);
 expect(strips[3].left-note.left-note.width).toBeLessThan(200);
 await expect(page.getByRole('button',{name:'Continue our adventure'})).toHaveCount(0);
 await page.screenshot({path:'test-results/gallery-desktop.png'});
 await page.evaluate(()=>{const w=window as any;while(w.__config.photos.length<40){const i=w.__config.photos.length+1;w.__config.photos.push({src:w.__config.photos[0].src,caption:`Extra memory ${i}`});}w.__ui.restart();});
 await expect(page.getByRole('button',{name:'Start adventure'})).toBeVisible();await expect(page.locator('.world-gallery')).toHaveCount(5);await expect(page.locator('.world-polaroid')).toHaveCount(40);
});
test('phone letter scrolls by touch and closes',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto('?test=1');await page.getByRole('button',{name:'Start adventure'}).tap();await page.evaluate(()=>(window as any).__ui.letter());
 const session=await context.newCDPSession(page);const box=await page.locator('.letter').boundingBox();const x=box!.x+box!.width/2,y=box!.y+box!.height-60;
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let d=20;d<=180;d+=20){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-d,id:1}]});await page.waitForTimeout(20);}
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);expect(await page.locator('.letter').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);await page.getByRole('button',{name:'Back',exact:true}).tap();await expect(page.getByRole('button',{name:'Play again'})).toBeVisible();await context.close();
});

test('finale photograph finishes loading and preserves its frame',async({page})=>{
 await page.goto('?test=1');await expect(page.getByRole('button',{name:'Start adventure'})).toBeVisible();await page.evaluate(()=>(window as any).__ui.finale());
 await expect(page.locator('.ending-photo img')).toHaveJSProperty('complete',true);await expect(page.locator('.ending-photo img')).not.toHaveJSProperty('naturalWidth',0);const ratio=await page.locator('.ending-photo img').evaluate(el=>{const image=el as HTMLImageElement;const css=getComputedStyle(image);return {shown:parseFloat(css.width)/parseFloat(css.height),natural:image.naturalWidth/image.naturalHeight};});expect(ratio.shown).toBeCloseTo(ratio.natural,2);await page.screenshot({path:'test-results/finale-desktop.png'});
});

test('held jump reaches the higher apex',async({page})=>{
 await page.goto('?test=1');await page.getByRole('button',{name:'Start adventure'}).click();await page.waitForTimeout(250);
 const start=await page.evaluate(()=>(window as any).__game.scene.getScene('Level').player.y);let apex=start;
 await page.keyboard.down('Space');
 for(let i=0;i<24;i++){await page.waitForTimeout(25);apex=Math.min(apex,await page.evaluate(()=>(window as any).__game.scene.getScene('Level').player.y));}
 await page.keyboard.up('Space');expect(start-apex).toBeGreaterThan(100);expect(start-apex).toBeLessThan(115);
});

for(const viewport of [{width:1280,height:720},{width:844,height:390}])test(`verbatim messages appear in order at ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);await page.goto('?test=1');await page.getByRole('button',{name:'Start adventure'}).click();
 const story=page.locator('#story-message');
 expect(await story.locator('p').textContent()).toBe(messages.opening);await expect(story).toBeVisible();
 expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').physics.world.isPaused)).toBe(false);
 await page.screenshot({path:`test-results/opening-message-${viewport.width}.png`});
 await page.getByRole('button',{name:'Keep going'}).click();await expect(story).toBeHidden();
 await page.evaluate(()=>{const s=(window as any).__game.scene.getScene('Level');s.player.body.reset((window as any).__config.galleries[2].x,411);s.player.setVelocity(0);});
 for(const img of await page.locator('.world-gallery').nth(2).locator('img').all())await expect(img).toHaveJSProperty('complete',true);
 await page.waitForTimeout(100);
 const letter=page.locator('.world-letter');
 expect(await letter.locator('p').textContent()).toBe(messages.middle);
 await page.evaluate(()=>{const w=window as any;const s=w.__game.scene.getScene('Level');s.player.body.reset(w.__config.middleLetter.x+w.__config.middleLetter.width/2-160,411);s.player.setVelocity(0);});
 await page.waitForTimeout(750);await expect(story).toBeHidden();
 const before=(await letter.boundingBox())!.x;
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(450);await page.keyboard.up('ArrowRight');
 expect((await letter.boundingBox())!.x).toBeLessThan(before-10);
 await expect(story).toBeHidden();await expect(page.locator('#dialogue')).not.toHaveClass(/visible/);await expect(letter.getByRole('button')).toHaveCount(0);
 expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').physics.world.isPaused)).toBe(false);
 await page.screenshot({path:`test-results/middle-message-${viewport.width}.png`});
 await page.evaluate(()=>(window as any).__ui.victory());await expect(page.getByText('YOU FOUND PRINCESS EYANA!')).toBeVisible();await page.getByRole('button',{name:'Our happy ending'}).click();
 expect(await page.locator('.final-message').textContent()).toBe(messages.ending);await page.getByRole('button',{name:'One more thing'}).click();expect(await page.locator('.letter-body p').allTextContents()).toEqual(messages.letter);
 await page.screenshot({path:`test-results/letter-${viewport.width}.png`});await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.locator('.final-message')).toHaveText(messages.ending);
});

for(const viewport of [{width:1280,height:720},{width:844,height:390}])test(`opening message follows walking forward and back at ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);await page.goto('?test=1');await page.getByRole('button',{name:'Start adventure'}).click();
 const story=page.locator('#story-message');await expect(story).toBeVisible();
 for(const img of await page.locator('.world-gallery').first().locator('img').all())await expect(img).not.toHaveJSProperty('naturalWidth',0);
 const edge=await page.locator('.world-gallery').first().evaluate(el=>parseFloat((el as HTMLElement).style.left));
 const cross=async(direction:'ArrowLeft'|'ArrowRight')=>{
  await page.evaluate(({x})=>{const s=(window as any).__game.scene.getScene('Level');s.player.body.reset(x,200);s.player.setVelocity(0).setAcceleration(0);},{x:edge+(direction==='ArrowRight'?-40:40)});
  await page.keyboard.down(direction);await page.waitForTimeout(450);await page.keyboard.up(direction);
 };
 await cross('ArrowRight');await expect(story).toBeHidden();
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Keep adventuring'}).click();await expect(story).toBeHidden();
 await cross('ArrowLeft');await expect(story).toBeVisible();expect(await story.locator('p').textContent()).toBe(messages.opening);
 await page.getByRole('button',{name:'Keep going'}).click();await expect(story).toBeHidden();
 await cross('ArrowRight');await expect(story).toBeHidden();await cross('ArrowLeft');await expect(story).toBeVisible();
 expect(await page.evaluate(()=>(window as any).__game.scene.getScene('Level').physics.world.isPaused)).toBe(false);
});
