import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '..', 'public', 'venue.json');

const SECTIONS_ACROSS = 5;
const SECTIONS_DOWN = 4;
const ROWS = 25;
const COLS = 30;
const SEAT_DX = 10;
const SEAT_DY = 12;
const SECTION_GAP = 60;
const MARGIN = 40;

const sectionWidth = COLS * SEAT_DX;
const sectionHeight = ROWS * SEAT_DY;

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

const letters = 'ABCDEFGHIJKLMNOPQRST';
const sections = [];
let sectionIndex = 0;

for (let sr = 0; sr < SECTIONS_DOWN; sr += 1) {
  for (let sc = 0; sc < SECTIONS_ACROSS; sc += 1) {
    const id = letters[sectionIndex];
    const tier = sr + 1;
    const rows = [];

    for (let r = 0; r < ROWS; r += 1) {
      const seats = [];
      for (let c = 0; c < COLS; c += 1) {
        const col = c + 1;
        seats.push({
          id: `${id}-${r + 1}-${String(col).padStart(2, '0')}`,
          col,
          x: c * SEAT_DX,
          y: r * SEAT_DY,
          priceTier: tier,
          status: pickStatus(),
        });
      }
      rows.push({ index: r + 1, seats });
    }

    sections.push({
      id,
      label: `Section ${id}`,
      transform: {
        x: MARGIN + sc * (sectionWidth + SECTION_GAP),
        y: MARGIN + sr * (sectionHeight + SECTION_GAP),
        scale: 1,
      },
      rows,
    });
    sectionIndex += 1;
  }
}

const width = MARGIN * 2 + SECTIONS_ACROSS * sectionWidth + (SECTIONS_ACROSS - 1) * SECTION_GAP;
const height = MARGIN * 2 + SECTIONS_DOWN * sectionHeight + (SECTIONS_DOWN - 1) * SECTION_GAP;

const venue = {
  venueId: 'arena-01',
  name: 'Metropolis Arena',
  map: { width, height },
  sections,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(venue));

const seatCount = SECTIONS_ACROSS * SECTIONS_DOWN * ROWS * COLS;
console.log(`Wrote ${seatCount} seats to ${outFile} (map ${width}x${height})`);
