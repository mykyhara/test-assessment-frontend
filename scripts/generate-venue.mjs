import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '..', 'public', 'venue.json');

const MARGIN = 60;
const ROW_GAP = 11;
const ELLIPSE_X = 1.3;
const ELLIPSE_Y = 1;
const AISLE_RATIO = 0.18;
const TAU = Math.PI * 2;

const rings = [
  { prefix: 'L', name: 'Lower', tier: 1, radius: 230, rows: 12, sections: 16, seatsPerRow: 20 },
  { prefix: 'M', name: 'Middle', tier: 2, radius: 392, rows: 14, sections: 18, seatsPerRow: 20 },
  { prefix: 'U', name: 'Upper', tier: 3, radius: 580, rows: 14, sections: 22, seatsPerRow: 20 },
];

let seed = 1337;
const random = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const pickStatus = () => {
  const r = random();
  if (r < 0.72) return 'available';
  if (r < 0.85) return 'sold';
  if (r < 0.95) return 'reserved';
  return 'held';
};

const outerRadius = Math.max(...rings.map((ring) => ring.radius + ring.rows * ROW_GAP));
const cx = MARGIN + outerRadius * ELLIPSE_X;
const cy = MARGIN + outerRadius * ELLIPSE_Y;

const sections = [];
let seatCount = 0;

for (const ring of rings) {
  const slot = TAU / ring.sections;
  const span = slot * (1 - AISLE_RATIO);
  for (let s = 0; s < ring.sections; s += 1) {
    const id = `${ring.prefix}${s + 1}`;
    const start = s * slot + (slot - span) / 2;
    const rows = [];
    for (let r = 0; r < ring.rows; r += 1) {
      const radius = ring.radius + r * ROW_GAP;
      const seats = [];
      for (let c = 0; c < ring.seatsPerRow; c += 1) {
        const angle = start + ((c + 0.5) / ring.seatsPerRow) * span;
        seats.push({
          id: `${id}-${r + 1}-${String(c + 1).padStart(2, '0')}`,
          col: c + 1,
          x: cx + Math.cos(angle) * radius * ELLIPSE_X,
          y: cy + Math.sin(angle) * radius * ELLIPSE_Y,
          priceTier: ring.tier,
          status: pickStatus(),
        });
      }
      rows.push({ index: r + 1, seats });
      seatCount += seats.length;
    }
    sections.push({
      id,
      label: `${ring.name} ${s + 1}`,
      transform: { x: 0, y: 0, scale: 1 },
      rows,
    });
  }
}

const fieldHalfX = rings[0].radius * ELLIPSE_X * 0.72;
const fieldHalfY = rings[0].radius * ELLIPSE_Y * 0.66;

const venue = {
  venueId: 'arena-01',
  name: 'Metropolis Arena',
  map: { width: Math.round(cx * 2), height: Math.round(cy * 2) },
  stage: {
    x: cx - fieldHalfX,
    y: cy - fieldHalfY,
    width: fieldHalfX * 2,
    height: fieldHalfY * 2,
    label: 'FIELD',
  },
  sections,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(venue));

console.log(`Wrote ${seatCount} seats to ${outFile} (map ${venue.map.width}x${venue.map.height})`);
