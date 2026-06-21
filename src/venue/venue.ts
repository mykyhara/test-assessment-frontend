import type { PlacedSeat, Venue } from './types';

const PRICE_BY_TIER: Record<number, number> = { 1: 250, 2: 180, 3: 120, 4: 80 };
const DEFAULT_PRICE = 60;

export const priceForTier = (tier: number) => PRICE_BY_TIER[tier] ?? DEFAULT_PRICE;

export const countSeats = (venue: Venue) =>
  venue.sections.reduce(
    (total, section) => total + section.rows.reduce((rows, row) => rows + row.seats.length, 0),
    0,
  );

async function loadVenue(url: string): Promise<Venue> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load venue (${response.status})`);
  return response.json();
}

const requests = new Map<string, Promise<Venue>>();

export function getVenue(url: string): Promise<Venue> {
  let request = requests.get(url);
  if (!request) {
    request = loadVenue(url);
    requests.set(url, request);
  }
  return request;
}

export function placeSeats(venue: Venue): PlacedSeat[] {
  const placed: PlacedSeat[] = [];
  for (const section of venue.sections) {
    const { x: tx, y: ty, scale } = section.transform;
    for (const row of section.rows) {
      for (const seat of row.seats) {
        placed.push({
          id: seat.id,
          sectionId: section.id,
          sectionLabel: section.label,
          row: row.index,
          col: seat.col,
          x: tx + seat.x * scale,
          y: ty + seat.y * scale,
          priceTier: seat.priceTier,
          price: priceForTier(seat.priceTier),
          status: seat.status,
        });
      }
    }
  }
  return placed;
}
