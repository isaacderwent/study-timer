import { useEffect, useState } from 'react';
import bgDay    from '../assets/bg-day.jpg';
import bgNight  from '../assets/bg-night.jpg';
import bgGolden from '../assets/bg-golden.jpg'; // used for both dawn and dusk

// ── Scenes ────────────────────────────────────────────────────────────────────
// Three images; the golden-hour image is layered twice so it fades in from
// both sides (night→golden→day and day→golden→night).
const SCENES = [
  { id: 'night',  src: bgNight  },
  { id: 'golden', src: bgGolden },
  { id: 'day',    src: bgDay    },
];

// ── Time weights ──────────────────────────────────────────────────────────────
// Returns { night, golden, day } each 0.0–1.0.
// Only one or two scenes are ever non-zero (clean two-way crossfades).
//
//  Night fully on  : h < 5  or  h >= 21
//  Night → Golden  : 5:00  – 6:30   (1.5 hr)
//  Golden → Day    : 6:30  – 8:00   (1.5 hr)
//  Day fully on    : 8:00  – 18:00
//  Day → Golden    : 18:00 – 19:30  (1.5 hr)
//  Golden → Night  : 19:30 – 21:00  (1.5 hr)
//
function getWeights() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  const clamp = t => Math.max(0, Math.min(1, t));
  const w = { night: 0, golden: 0, day: 0 };

  if (h < 5 || h >= 21) {
    w.night = 1;
  } else if (h < 6.5) {
    // Night → Golden
    const t = clamp((h - 5) / 1.5);
    w.night  = 1 - t;
    w.golden = t;
  } else if (h < 8) {
    // Golden → Day
    const t = clamp((h - 6.5) / 1.5);
    w.golden = 1 - t;
    w.day    = t;
  } else if (h < 18) {
    w.day = 1;
  } else if (h < 19.5) {
    // Day → Golden
    const t = clamp((h - 18) / 1.5);
    w.day    = 1 - t;
    w.golden = t;
  } else {
    // Golden → Night
    const t = clamp((h - 19.5) / 1.5);
    w.golden = 1 - t;
    w.night  = t;
  }

  return w;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PixelBackground() {
  const [weights, setWeights] = useState(() => getWeights());

  useEffect(() => {
    const id = setInterval(() => setWeights(getWeights()), 60_000);
    return () => clearInterval(id);
  }, []);

  return SCENES.map(({ id, src }) => (
    <div
      key={id}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: weights[id],
        transition: 'opacity 90s linear',
      }}
    />
  ));
}
