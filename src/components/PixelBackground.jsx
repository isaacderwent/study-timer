import { useEffect, useState } from 'react';
import pixelBg from '../assets/pixel-bg.jpg';

// ── Scene definitions ─────────────────────────────────────────────────────────
// The source image is a 2×2 grid; CSS background-size 200% 200% + position
// lets us crop exactly one quadrant per layer.
//
//   Top-left  (0%   0%)  = Sunrise / dawn
//   Top-right (100% 0%)  = Sunset / dusk
//   Bottom-left (0% 100%) = Bright daytime
//   Bottom-right (100% 100%) = Night
//
const SCENES = [
  { id: 'night',   bgPos: '100% 100%' },
  { id: 'sunrise', bgPos: '0%   0%'   },
  { id: 'day',     bgPos: '0%   100%' },
  { id: 'sunset',  bgPos: '100% 0%'   },
];

// ── Time-based weight calculator ──────────────────────────────────────────────
// Returns { night, sunrise, day, sunset } — exactly two scenes are ever
// non-zero during transition windows; they sum to 1.0 at all times.
//
// Schedule:
//   Night fully on : h < 5  or  h >= 21
//   Night → Sunrise: 5:00 – 6:30  (1.5 hr crossfade)
//   Sunrise → Day  : 6:30 – 8:00  (1.5 hr crossfade)
//   Day fully on   : 8:00 – 18:00
//   Day → Sunset   : 18:00 – 19:30 (1.5 hr crossfade)
//   Sunset → Night : 19:30 – 21:00 (1.5 hr crossfade)
//
function getSceneWeights() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  const clamp = t => Math.max(0, Math.min(1, t));
  const w = { night: 0, sunrise: 0, day: 0, sunset: 0 };

  if (h < 5 || h >= 21) {
    // Full night
    w.night = 1;
  } else if (h < 6.5) {
    // Night → Sunrise  (5:00 – 6:30)
    const t = clamp((h - 5) / 1.5);
    w.night   = 1 - t;
    w.sunrise = t;
  } else if (h < 8) {
    // Sunrise → Day  (6:30 – 8:00)
    const t = clamp((h - 6.5) / 1.5);
    w.sunrise = 1 - t;
    w.day     = t;
  } else if (h < 18) {
    // Full day
    w.day = 1;
  } else if (h < 19.5) {
    // Day → Sunset  (18:00 – 19:30)
    const t = clamp((h - 18) / 1.5);
    w.day    = 1 - t;
    w.sunset = t;
  } else {
    // Sunset → Night  (19:30 – 21:00)
    const t = clamp((h - 19.5) / 1.5);
    w.sunset = 1 - t;
    w.night  = t;
  }

  return w;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PixelBackground() {
  const [weights, setWeights] = useState(() => getSceneWeights());

  // Re-evaluate every 60 s; CSS transition handles smooth blending
  useEffect(() => {
    const id = setInterval(() => setWeights(getSceneWeights()), 60_000);
    return () => clearInterval(id);
  }, []);

  return SCENES.map(({ id, bgPos }) => (
    <div
      key={id}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url(${pixelBg})`,
        backgroundSize: '200% 200%',
        backgroundPosition: bgPos,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        opacity: weights[id],
        transition: 'opacity 90s linear',
      }}
    />
  ));
}
