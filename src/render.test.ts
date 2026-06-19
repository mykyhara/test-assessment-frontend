import { describe, it, expect } from 'vitest';
import { hitTest, screenToWorld } from './render';
import type { PlacedSeat } from './types';

const seats: PlacedSeat[] = [
  {
    id: 's1',
    sectionId: 'A',
    sectionLabel: 'A',
    row: 1,
    col: 1,
    x: 100,
    y: 100,
    priceTier: 1,
    price: 1,
    status: 'available',
  },
  {
    id: 's2',
    sectionId: 'A',
    sectionLabel: 'A',
    row: 1,
    col: 2,
    x: 200,
    y: 200,
    priceTier: 1,
    price: 1,
    status: 'available',
  },
];

describe('screenToWorld', () => {
  it('inverts the translate and scale of the transform', () => {
    expect(screenToWorld(120, 120, { scale: 2, offsetX: 20, offsetY: 20 })).toEqual({
      x: 50,
      y: 50,
    });
  });
});

describe('hitTest', () => {
  it('returns the seat closest to the point', () => {
    expect(hitTest(seats, 101, 99)?.id).toBe('s1');
  });

  it('returns null when no seat is within reach', () => {
    expect(hitTest(seats, 150, 150)).toBeNull();
  });
});
