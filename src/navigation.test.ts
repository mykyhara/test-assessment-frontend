import { describe, it, expect } from 'vitest';
import { SeatNavigator } from './navigation';
import type { PlacedSeat } from './types';

function grid(): PlacedSeat[] {
  const seats: PlacedSeat[] = [];
  for (let row = 1; row <= 2; row += 1) {
    for (let col = 1; col <= 2; col += 1) {
      seats.push({
        id: `A-${row}-${col}`,
        sectionId: 'A',
        sectionLabel: 'Section A',
        row,
        col,
        x: col * 10,
        y: row * 10,
        priceTier: 1,
        price: 1,
        status: 'available',
      });
    }
  }
  return seats;
}

describe('SeatNavigator', () => {
  const nav = new SeatNavigator(grid());

  it('starts at the first seat', () => {
    expect(nav.first()?.id).toBe('A-1-1');
  });

  it('moves right and clamps at the row edge', () => {
    expect(nav.next('A-1-1', 'right')?.id).toBe('A-1-2');
    expect(nav.next('A-1-2', 'right')?.id).toBe('A-1-2');
  });

  it('moves between rows and clamps at the top', () => {
    expect(nav.next('A-1-1', 'down')?.id).toBe('A-2-1');
    expect(nav.next('A-2-1', 'up')?.id).toBe('A-1-1');
    expect(nav.next('A-1-1', 'up')?.id).toBe('A-1-1');
  });
});
