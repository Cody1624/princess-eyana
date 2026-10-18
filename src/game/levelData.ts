export const WORLD_WIDTH = 9790;
export const GOAL_X = 9220;
export const GROUND_Y = 438;
export const gaps = [1200, 2450, 3390, 4330, 6280, 7300];
export const platforms = (() => {
  const pieces: { x: number; y: number; width: number; height: number }[] = [];
  let start = 0;
  for (const gap of gaps) { pieces.push({ x: start, y: GROUND_Y, width: gap - start, height: 150 }); start = gap + 64; }
  pieces.push({ x: start, y: GROUND_Y, width: WORLD_WIDTH - start, height: 150 });
  for (const x of [2200, 3000, 3950, 5870, 6820]) pieces.push({ x, y: 357, width: 160, height: 24 });
  return pieces;
})();
export const checkpoints = [100, 1100, 1650, 2350, 2900, 3290, 4100, 4230, 4650, 5970, 6180, 6970, 7200, 7520, 8370];
export const heartPositions = Array.from({ length: 25 }, (_, i) => ({ x: 500 + i * 300 + (500 + i * 300 >= 4733 ? 970 : 0), y: i % 5 === 0 ? 310 : 392 }));
