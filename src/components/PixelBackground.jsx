import { useEffect, useRef, useState } from 'react';

// 240×135 logical pixels at 2 real pixels each = 480×270 canvas
// CSS scales to 100vw × 100vh with image-rendering: pixelated
const LP = 2;
const LW = 240;
const LH = 135;

// ── Primitive helpers ──────────────────────────────────────────────────────────
function px(ctx, x, y, color) {
  if (x < 0 || x >= LW || y < 0 || y >= LH) return;
  ctx.fillStyle = color;
  ctx.fillRect(x * LP, y * LP, LP, LP);
}

function hline(ctx, x, y, w, color) {
  if (y < 0 || y >= LH) return;
  const x0 = Math.max(0, x);
  const x1 = Math.min(LW, x + w);
  if (x1 <= x0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x0 * LP, y * LP, (x1 - x0) * LP, LP);
}

function fill(ctx, x, y, w, h, color) {
  if (x >= LW || y >= LH || x + w <= 0 || y + h <= 0) return;
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(LW, x + w), y1 = Math.min(LH, y + h);
  ctx.fillStyle = color;
  ctx.fillRect(x0 * LP, y0 * LP, (x1 - x0) * LP, (y1 - y0) * LP);
}

// Seeded LCG PRNG
function mkRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ── Night opacity based on time of day ────────────────────────────────────────
// Sunrise transition: 5am–7am (night→day)
// Sunset transition: 20pm–22pm (day→night)
function getNightOpacity() {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  if (h >= 7 && h < 20) return 0;          // full day
  if (h < 5 || h >= 22) return 1;          // full night
  if (h < 7) return 1 - (h - 5) / 2;      // dawn: 5→7 fades night out
  return (h - 20) / 2;                      // dusk: 20→22 fades night in
}

// ══════════════════════════════════════════════════════════════════════════════
// ── NIGHT SCENE ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function drawSky(ctx) {
  const bands = [
    [0,   6,  '#050210'],
    [6,   13, '#07051a'],
    [13,  20, '#090720'],
    [20,  30, '#0a0924'],
    [30,  42, '#0b0d2e'],
    [42,  55, '#0c1138'],
    [55,  65, '#0d1435'],
    [65,  73, '#0e1830'],
    [73,  80, '#0f1c2c'],
    [80,  90, '#101e28'],
  ];
  for (const [y0, y1, col] of bands) fill(ctx, 0, y0, LW, y1 - y0, col);
}

function drawAurora(ctx) {
  const rand = mkRand(0xa04a0a);
  const streaks = [
    { y: 14, color: '#003322', amplitude: 2, wavelength: 40 },
    { y: 18, color: '#002a1e', amplitude: 1, wavelength: 55 },
    { y: 11, color: '#002818', amplitude: 3, wavelength: 70 },
  ];
  for (const { y, color, amplitude, wavelength } of streaks) {
    for (let x = 0; x < LW; x++) {
      const dy = Math.round(amplitude * Math.sin((x / wavelength) * Math.PI * 2));
      if (rand() < 0.6) px(ctx, x, y + dy, color);
      if (rand() < 0.3) px(ctx, x, y + dy + 1, color);
    }
  }
}

function drawStars(ctx) {
  const rand = mkRand(0x54af13d);
  const palette = ['#ffe8a0', '#ffffff', '#ffeebb', '#c8d8ff', '#ffe0c0', '#d8e8ff'];
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rand() * LW);
    const y = Math.floor(rand() * 62);
    const c = palette[Math.floor(rand() * palette.length)];
    const size = rand();
    px(ctx, x, y, c);
    if (size > 0.75) {
      ctx.fillStyle = c + '88';
      ctx.fillRect((x - 1) * LP, y * LP, LP, LP);
      ctx.fillRect((x + 1) * LP, y * LP, LP, LP);
      ctx.fillRect(x * LP, (y - 1) * LP, LP, LP);
      ctx.fillRect(x * LP, (y + 1) * LP, LP, LP);
    }
    if (size > 0.92) {
      ctx.fillStyle = c + '33';
      ctx.fillRect((x - 2) * LP, y * LP, LP, LP);
      ctx.fillRect((x + 2) * LP, y * LP, LP, LP);
      ctx.fillRect(x * LP, (y - 2) * LP, LP, LP);
      ctx.fillRect(x * LP, (y + 2) * LP, LP, LP);
    }
  }
}

function drawMoon(ctx) {
  const mx = 192, my = 6;
  const disc  = '#d6d6b2';
  const glow  = '#d6d6b233';
  const shadow = '#0e0b28';
  const glowRows = [
    [2, 7], [0, 9], [0, 11], [0, 11], [0, 11],
    [0, 11], [0, 11], [0, 11], [0, 9], [2, 7],
  ];
  ctx.fillStyle = glow;
  glowRows.forEach(([dx, w], dy) => {
    ctx.fillRect((mx + dx - 1) * LP, (my + dy - 1) * LP, (w + 2) * LP, LP);
  });
  const discRows = [
    [2, 7], [1, 9], [0, 11], [0, 11], [0, 11],
    [0, 11], [0, 11], [0, 11], [1, 9], [2, 7],
  ];
  discRows.forEach(([dx, w], dy) => hline(ctx, mx + dx, my + dy, w, disc));
  const shadowRows = [
    [4, 5], [3, 7], [2, 9], [2, 9], [2, 9],
    [2, 9], [2, 9], [2, 9], [3, 7], [4, 5],
  ];
  shadowRows.forEach(([dx, w], dy) => hline(ctx, mx + dx, my + dy, w, shadow));
}

function drawMountains(ctx) {
  const ground = 92;
  const mountains = [
    [30,  64, 28, 22, '#040904'],
    [80,  58, 38, 30, '#050a05'],
    [148, 61, 32, 26, '#040904'],
    [205, 56, 45, 35, '#050a05'],
  ];
  for (const [px_, peakY, lw, rw] of mountains) {
    for (let y = peakY; y <= ground; y++) {
      const frac = (y - peakY) / (ground - peakY);
      const left  = Math.round(px_ - lw * frac);
      const right = Math.round(px_ + rw * frac);
      hline(ctx, left, y, right - left, '#040904');
    }
  }
  for (const [px_, peakY] of mountains) {
    px(ctx, px_, peakY - 1, '#030703');
  }
}

function drawPine(ctx, cx, tipY, height, topColor, botColor) {
  const layers = Math.max(3, Math.round(height / 7));
  const layerStep = Math.floor(height * 0.72 / layers);
  for (let l = 0; l < layers; l++) {
    const frac = l / (layers - 1);
    const color = frac < 0.5 ? topColor : botColor;
    const baseW  = 3 + l * 3;
    const lTop   = tipY + l * (layerStep - 1);
    for (let r = 0; r < layerStep + 2; r++) {
      const w  = baseW + r;
      const lx = cx - Math.floor(w / 2);
      hline(ctx, lx, lTop + r, w, color);
    }
  }
  const trunkH = Math.max(2, Math.floor(height * 0.14));
  fill(ctx, cx, tipY + height - trunkH + 1, 2, trunkH + 1, '#3a2510');
}

function drawTrees(ctx) {
  const far = '#030903';
  for (let x = 2; x < LW; x += 6) {
    const h = 14 + ((x * 7) % 10);
    const ty = 66 - ((x * 3) % 8);
    drawPine(ctx, x, ty, h, far, far);
  }
  const midA = '#071407', midB = '#0a1c0a';
  const midTrees = [
    6, 18, 30, 44, 56, 68, 80, 94, 106, 120,
    132, 146, 158, 170, 184, 196, 208, 222, 234,
  ];
  midTrees.forEach(x => {
    const h = 20 + ((x * 11) % 14);
    const ty = 76 - ((x * 5) % 10);
    drawPine(ctx, x, ty, h, midA, midB);
  });
  const nearA = '#0d1f0d', nearB = '#172e17';
  const nearTrees = [
    [14,  90, 35], [38,  88, 40], [62,  86, 44],
    [90,  92, 33], [114, 87, 42], [140, 90, 36],
    [165, 88, 41], [190, 85, 45], [214, 91, 34],
    [232, 89, 38],
  ];
  for (const [cx, ty, h] of nearTrees) {
    drawPine(ctx, cx, ty, h, nearA, nearB);
  }
}

function drawGround(ctx) {
  const layers = [
    [110, 1, '#070e07'],
    [111, 1, '#091209'],
    [112, 2, '#0c180c'],
    [114, 2, '#0f1f0f'],
    [116, 3, '#122412'],
    [119, 3, '#162c16'],
    [122, 5, '#1a3418'],
    [127, 8, '#1e3c1c'],
  ];
  for (const [y, h, col] of layers) fill(ctx, 0, y, LW, h, col);
  const rand = mkRand(0x9a550);
  for (let x = 0; x < LW; x++) {
    if (rand() < 0.38) {
      const h = rand() < 0.5 ? 1 : 2;
      const col = rand() < 0.5 ? '#1f3e1a' : '#243f1e';
      fill(ctx, x, 110 - h, 1, h, col);
    }
  }
  const rand2 = mkRand(0x90d2);
  for (let x = 0; x < LW; x += 3) {
    if (rand2() < 0.2) {
      fill(ctx, x, 122, Math.floor(rand2() * 4) + 2, 2, '#172d14');
    }
  }
}

function drawFlower(ctx, cx, groundY, color, rand) {
  const stemH = 7 + Math.floor(rand() * 8);
  const stemTop = groundY - stemH;
  for (let y = stemTop; y < groundY; y++) {
    const mid = stemTop + Math.floor(stemH * 0.5);
    const offset = y === mid ? (cx % 2 === 0 ? 1 : -1) : 0;
    px(ctx, cx + offset, y, '#2d6a2d');
  }
  const l1y = stemTop + Math.floor(stemH * 0.35);
  const l2y = stemTop + Math.floor(stemH * 0.62);
  const lSide = cx % 2 === 0 ? 1 : -1;
  hline(ctx, cx + lSide,     l1y, 3, '#3a8a3a');
  px(ctx,    cx + lSide * 2, l1y, '#2d6a2d');
  hline(ctx, cx - lSide,     l2y, 3, '#3a8a3a');
  px(ctx,    cx - lSide * 2, l2y, '#2d6a2d');
  const hy = stemTop - 2;
  [[0,-3],[0,3],[-3,0],[3,0],[-2,-2],[2,-2],[-2,2],[2,2]].forEach(([dx,dy]) => {
    px(ctx, cx + dx, hy + dy, color);
  });
  [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => {
    px(ctx, cx + dx, hy + dy, color);
  });
  px(ctx, cx, hy, '#ffe566');
  px(ctx, cx, hy - 1, '#ffe566');
}

function drawFlowers(ctx) {
  const palette = [
    '#ff6b9d', '#ffd700', '#e8e8e8', '#c084fc',
    '#ff8c42', '#ff9eb5', '#88eebb', '#7be8ff',
    '#ffb3e6', '#f0ff70', '#b0e0ff', '#ffa0a0',
  ];
  const rand = mkRand(0xf10e45);
  for (let x = 3; x < LW - 2; x += 5 + Math.floor((x * 3) % 4)) {
    const col = palette[Math.floor(rand() * palette.length)];
    const gy = 111 + Math.floor(rand() * 4);
    drawFlower(ctx, x, gy, col, rand);
  }
  for (let x = 7; x < LW - 4; x += 9 + Math.floor((x * 5) % 7)) {
    const col = palette[Math.floor(rand() * palette.length)];
    const gy = 101 + Math.floor(rand() * 4);
    drawFlower(ctx, x, gy, col, rand);
  }
  for (let x = 12; x < LW - 8; x += 15 + Math.floor((x * 7) % 12)) {
    const col = palette[Math.floor(rand() * palette.length)];
    drawFlower(ctx, x, 93 + Math.floor(rand() * 3), col, rand);
  }
}

function drawFireflies(ctx) {
  const rand = mkRand(0xf14ef12);
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rand() * LW);
    const y = 88 + Math.floor(rand() * 26);
    const bright = rand() > 0.5;
    ctx.fillStyle = bright ? '#ffffaa44' : '#ffffaa22';
    ctx.fillRect((x - 1) * LP, (y - 1) * LP, 3 * LP, 3 * LP);
    ctx.fillStyle = bright ? '#ffffaacc' : '#ffffaa77';
    ctx.fillRect(x * LP, y * LP, LP, LP);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DAY SCENE ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function drawDaySky(ctx) {
  const bands = [
    [0,   10, '#1a3d8a'],
    [10,  22, '#2352b0'],
    [22,  35, '#2e6fd4'],
    [35,  50, '#4a8ee0'],
    [50,  65, '#6aade8'],
    [65,  80, '#88c0ef'],
    [80,  95, '#a8d8f5'],
    [95, 110, '#c5e8f8'],
  ];
  for (const [y0, y1, col] of bands) fill(ctx, 0, y0, LW, y1 - y0, col);
}

function drawSun(ctx) {
  const sx = 188, sy = 22;
  // Outer glow rings
  ctx.fillStyle = '#ffe56614';
  ctx.fillRect((sx - 14) * LP, (sy - 14) * LP, 29 * LP, 29 * LP);
  ctx.fillStyle = '#ffe56628';
  ctx.fillRect((sx - 11) * LP, (sy - 11) * LP, 23 * LP, 23 * LP);
  ctx.fillStyle = '#ffe56640';
  ctx.fillRect((sx - 9) * LP, (sy - 9) * LP, 19 * LP, 19 * LP);

  // Rays (8 directions, each 3-4px)
  const rayCol = '#ffd700';
  // Cardinal
  for (let i = 0; i < 4; i++) {
    hline(ctx, sx + 8 + i, sy, 1, rayCol);
    hline(ctx, sx - 11 + i, sy, 1, rayCol);
    px(ctx, sx, sy - 9 - i, rayCol);
    px(ctx, sx, sy + 9 + i, rayCol);
  }
  // Diagonal
  for (let i = 0; i < 3; i++) {
    px(ctx, sx + 7 + i, sy - 7 - i, rayCol);
    px(ctx, sx - 7 - i, sy - 7 - i, rayCol);
    px(ctx, sx + 7 + i, sy + 7 + i, rayCol);
    px(ctx, sx - 7 - i, sy + 7 + i, rayCol);
  }

  // Disc — filled circle r=7
  for (let dy = -7; dy <= 7; dy++) {
    const half = Math.round(Math.sqrt(49 - dy * dy));
    hline(ctx, sx - half, sy + dy, half * 2, '#ffe566');
  }
  // Bright centre r=3
  for (let dy = -3; dy <= 3; dy++) {
    const half = Math.round(Math.sqrt(9 - dy * dy));
    hline(ctx, sx - half, sy + dy, half * 2, '#fff8b0');
  }
}

function drawDayClouds(ctx) {
  function cloud(cx, cy, w) {
    const c1 = '#ffffff', c2 = '#e8f4ff', c3 = '#d0e8f8';
    const hw = Math.floor(w / 2);
    hline(ctx, cx - hw + 3, cy - 3, w - 6, c1);
    hline(ctx, cx - hw + 1, cy - 2, w - 2, c1);
    hline(ctx, cx - hw,     cy - 1, w,     c1);
    hline(ctx, cx - hw,     cy,     w,     c1);
    hline(ctx, cx - hw,     cy + 1, w,     c2);
    hline(ctx, cx - hw + 1, cy + 2, w - 2, c2);
    hline(ctx, cx - hw + 2, cy + 3, w - 4, c3);
    // Second bump
    const bx = cx - Math.floor(hw * 0.4);
    hline(ctx, bx - 2, cy - 4, 5, c1);
    hline(ctx, bx - 3, cy - 5, 7, c1);
    hline(ctx, bx - 2, cy - 6, 5, c2);
  }
  cloud(38,  24, 22);
  cloud(112, 16, 26);
  cloud(168, 26, 20);

  // Small wisps
  function wisp(cx, cy) {
    hline(ctx, cx - 2, cy,     5, '#e8f4ff');
    hline(ctx, cx - 3, cy + 1, 7, '#ffffff');
    hline(ctx, cx - 2, cy + 2, 5, '#e0eff8');
  }
  wisp(74,  30);
  wisp(200, 18);
  wisp(140, 11);
}

function drawDayBirds(ctx) {
  const birdColor = '#1a2a3a';
  // Each bird: two-pixel V shape
  const birds = [
    [18, 14], [26, 10], [48, 20], [82, 9],
    [130, 18], [155, 12], [175, 22], [212, 16],
    [225, 8],
  ];
  for (const [bx, by] of birds) {
    // Left wing
    px(ctx, bx - 2, by,     birdColor);
    px(ctx, bx - 1, by - 1, birdColor);
    // Right wing
    px(ctx, bx + 1, by - 1, birdColor);
    px(ctx, bx + 2, by,     birdColor);
  }
}

function drawDayMountains(ctx) {
  const ground = 92;
  const mountains = [
    [30,  64, 28, 22],
    [80,  58, 38, 30],
    [148, 61, 32, 26],
    [205, 56, 45, 35],
  ];
  for (const [px_, peakY, lw, rw] of mountains) {
    for (let y = peakY; y <= ground; y++) {
      const frac = (y - peakY) / (ground - peakY);
      const left  = Math.round(px_ - lw * frac);
      const right = Math.round(px_ + rw * frac);
      // Blue-grey mountains that get slightly darker toward base
      const col = frac < 0.5 ? '#7888aa' : '#5a6a82';
      hline(ctx, left, y, right - left, col);
    }
    // Snow cap
    px(ctx, px_, peakY - 1, '#d8e8f0');
    px(ctx, px_ - 1, peakY,    '#d8e8f0');
    px(ctx, px_ + 1, peakY,    '#d8e8f0');
  }
}

function drawDayTrees(ctx) {
  // Far silhouette — muted blue-green for atmospheric haze
  const far = '#4a6e4a';
  for (let x = 2; x < LW; x += 6) {
    const h = 14 + ((x * 7) % 10);
    const ty = 66 - ((x * 3) % 8);
    drawPine(ctx, x, ty, h, far, far);
  }
  // Mid layer
  const midA = '#2e6a2e', midB = '#3a8a3a';
  const midTrees = [
    6, 18, 30, 44, 56, 68, 80, 94, 106, 120,
    132, 146, 158, 170, 184, 196, 208, 222, 234,
  ];
  midTrees.forEach(x => {
    const h = 20 + ((x * 11) % 14);
    const ty = 76 - ((x * 5) % 10);
    drawPine(ctx, x, ty, h, midA, midB);
  });
  // Near trees — vivid bright greens
  const nearA = '#1e5c1e', nearB = '#2a7a2a';
  const nearTrees = [
    [14,  90, 35], [38,  88, 40], [62,  86, 44],
    [90,  92, 33], [114, 87, 42], [140, 90, 36],
    [165, 88, 41], [190, 85, 45], [214, 91, 34],
    [232, 89, 38],
  ];
  for (const [cx, ty, h] of nearTrees) {
    drawPine(ctx, cx, ty, h, nearA, nearB);
  }
}

function drawDayGround(ctx) {
  const layers = [
    [110, 1, '#3a7a1a'],
    [111, 1, '#429020'],
    [112, 2, '#4ea024'],
    [114, 2, '#5ab02a'],
    [116, 3, '#62be2e'],
    [119, 3, '#6ac832'],
    [122, 5, '#74d438'],
    [127, 8, '#7ae03c'],
  ];
  for (const [y, h, col] of layers) fill(ctx, 0, y, LW, h, col);
  // Grass tufts
  const rand = mkRand(0x9a5501);
  for (let x = 0; x < LW; x++) {
    if (rand() < 0.38) {
      const h = rand() < 0.5 ? 1 : 2;
      const col = rand() < 0.5 ? '#5ab82a' : '#66c430';
      fill(ctx, x, 110 - h, 1, h, col);
    }
  }
  // Ground patches
  const rand2 = mkRand(0x90d201);
  for (let x = 0; x < LW; x += 3) {
    if (rand2() < 0.2) {
      fill(ctx, x, 122, Math.floor(rand2() * 4) + 2, 2, '#5ab02a');
    }
  }
}

function drawDayFlowers(ctx) {
  // Brighter day palette
  const palette = [
    '#ff4488', '#ffdd00', '#ffffff', '#dd88ff',
    '#ff6622', '#ff88bb', '#44ddaa', '#44ccff',
    '#ffaaee', '#eeff44', '#aaddff', '#ff8888',
  ];
  const rand = mkRand(0xf10e46);
  for (let x = 3; x < LW - 2; x += 5 + Math.floor((x * 3) % 4)) {
    const col = palette[Math.floor(rand() * palette.length)];
    const gy = 111 + Math.floor(rand() * 4);
    drawFlower(ctx, x, gy, col, rand);
  }
  for (let x = 7; x < LW - 4; x += 9 + Math.floor((x * 5) % 7)) {
    const col = palette[Math.floor(rand() * palette.length)];
    const gy = 101 + Math.floor(rand() * 4);
    drawFlower(ctx, x, gy, col, rand);
  }
  for (let x = 12; x < LW - 8; x += 15 + Math.floor((x * 7) % 12)) {
    const col = palette[Math.floor(rand() * palette.length)];
    drawFlower(ctx, x, 93 + Math.floor(rand() * 3), col, rand);
  }
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PixelBackground() {
  const dayRef   = useRef(null);
  const nightRef = useRef(null);
  const [nightOpacity, setNightOpacity] = useState(() => getNightOpacity());

  useEffect(() => {
    // Draw day canvas
    const dc = dayRef.current;
    if (dc) {
      dc.width  = LW * LP;
      dc.height = LH * LP;
      const ctx = dc.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      drawDaySky(ctx);
      drawSun(ctx);
      drawDayClouds(ctx);
      drawDayBirds(ctx);
      drawDayMountains(ctx);
      drawDayTrees(ctx);
      drawDayGround(ctx);
      drawDayFlowers(ctx);
    }

    // Draw night canvas
    const nc = nightRef.current;
    if (nc) {
      nc.width  = LW * LP;
      nc.height = LH * LP;
      const ctx = nc.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      drawSky(ctx);
      drawAurora(ctx);
      drawStars(ctx);
      drawMoon(ctx);
      drawMountains(ctx);
      drawTrees(ctx);
      drawGround(ctx);
      drawFlowers(ctx);
      drawFireflies(ctx);
    }
  }, []);

  // Update opacity every 60s (CSS transition handles smooth blending)
  useEffect(() => {
    const id = setInterval(() => setNightOpacity(getNightOpacity()), 60000);
    return () => clearInterval(id);
  }, []);

  const canvasStyle = {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    imageRendering: 'pixelated',
  };

  return (
    <>
      <canvas ref={dayRef}   style={{ ...canvasStyle, zIndex: -2 }} />
      <canvas ref={nightRef} style={{ ...canvasStyle, zIndex: -1, opacity: nightOpacity, transition: 'opacity 90s linear' }} />
    </>
  );
}
