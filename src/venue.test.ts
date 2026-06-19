import { describe, it, expect } from 'vitest';
import { placeSeats, priceForTier } from './venue';
import type { Venue } from './types';

const venue: Venue = {
  venueId: 'v',
  name: 'V',
  map: { width: 100, height: 100 },
  sections: [
    {
      id: 'A',
      label: 'Section A',
      transform: { x: 10, y: 20, scale: 2 },
      rows: [
        {
          index: 1,
          seats: [{ id: 'A-1-01', col: 1, x: 5, y: 5, priceTier: 1, status: 'available' }],
        },
      ],
    },
  ],
};

describe('placeSeats', () => {
  it('applies the section transform to produce absolute coordinates', () => {
    const [seat] = placeSeats(venue);
    expect(seat).toMatchObject({
      id: 'A-1-01',
      sectionLabel: 'Section A',
      row: 1,
      col: 1,
      x: 20,
      y: 30,
      price: 250,
    });
  });
});

describe('priceForTier', () => {
  it('maps known tiers and falls back for unknown ones', () => {
    expect(priceForTier(1)).toBe(250);
    expect(priceForTier(99)).toBe(60);
  });
});
