import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');

const MARGIN = 60;
const ROW_GAP = 11;
const ELLIPSE_X = 1.3;
const ELLIPSE_Y = 1;
const AISLE_RATIO = 0.18;
const TAU = Math.PI * 2;

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

function buildVenue(rings) {
  seed = 1337;
  const outerRadius = Math.max(...rings.map((ring) => ring.radius + ring.rows * ROW_GAP));
  const cx = MARGIN + outerRadius * ELLIPSE_X;
  const cy = MARGIN + outerRadius * ELLIPSE_Y;
  const sections = [];

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
  return {
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
}

const tier = (prefix, name, t) => (radius, rows, sections, seatsPerRow) => ({
  prefix,
  name,
  tier: t,
  radius,
  rows,
  sections,
  seatsPerRow,
});
const lower = tier('L', 'Lower', 1);
const middle = tier('M', 'Middle', 2);
const upper = tier('U', 'Upper', 3);

const presets = [
  {
    file: 'venues/arena-1k.json',
    rings: [lower(150, 5, 8, 8), middle(230, 5, 10, 8), upper(310, 4, 10, 8)],
  },
  {
    file: 'venues/arena-2k.json',
    rings: [lower(170, 6, 10, 9), middle(260, 7, 12, 9), upper(360, 6, 12, 9)],
  },
  {
    file: 'venues/arena-5k.json',
    rings: [lower(200, 9, 12, 12), middle(330, 10, 14, 12), upper(470, 10, 16, 12)],
  },
  {
    file: 'venues/arena-10k.json',
    rings: [lower(220, 10, 14, 18), middle(360, 12, 16, 18), upper(540, 13, 18, 18)],
  },
  {
    file: 'venue.json',
    rings: [lower(230, 12, 16, 20), middle(392, 14, 18, 20), upper(580, 14, 22, 20)],
  },
];

mkdirSync(join(publicDir, 'venues'), { recursive: true });
for (const preset of presets) {
  const venue = buildVenue(preset.rings);
  const seatCount = venue.sections.reduce(
    (total, section) =>
      total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0),
    0,
  );
  writeFileSync(join(publicDir, preset.file), JSON.stringify(venue));
  console.log(`${preset.file}: ${seatCount} seats (${venue.map.width}x${venue.map.height})`);
}
