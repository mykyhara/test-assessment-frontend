import { describe, it, expect, beforeEach } from 'vitest';
import { loadSelection, MAX_SEATS, saveSelection, toggleSeat } from './selection';
import type { PlacedSeat, SeatStatus } from './types';

const seat = (id: string, status: SeatStatus = 'available'): PlacedSeat => ({
  id,
  sectionId: 'A',
  sectionLabel: 'Section A',
  row: 1,
  col: 1,
  x: 0,
  y: 0,
  priceTier: 1,
  price: 250,
  status,
});

describe('toggleSeat', () => {
  it('adds an available seat', () => {
    expect(toggleSeat([], seat('A-1-01'))).toEqual(['A-1-01']);
  });

  it('removes a seat that is already selected', () => {
    expect(toggleSeat(['A-1-01'], seat('A-1-01'))).toEqual([]);
  });

  it('ignores seats that are not available', () => {
    expect(toggleSeat([], seat('A-1-02', 'sold'))).toEqual([]);
  });

  it('does not exceed the maximum', () => {
    const ids = Array.from({ length: MAX_SEATS }, (_, i) => `s${i}`);
    expect(toggleSeat(ids, seat('extra'))).toEqual(ids);
  });
});

describe('selection storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips selected ids', () => {
    saveSelection(['a', 'b']);
    expect(loadSelection()).toEqual(['a', 'b']);
  });

  it('returns an empty list for missing or invalid data', () => {
    expect(loadSelection()).toEqual([]);
    localStorage.setItem('seating-map.selection', '{not json');
    expect(loadSelection()).toEqual([]);
  });
});
